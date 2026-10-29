import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_FILE = path.join(__dirname, 'paystack-device-store.json');

export interface DeviceEntitlementRecord {
  deviceId: string;
  hardwareSignature: string;
  deviceFingerprint: string;
  deviceSecretHash: string;
  compositeDeviceHash: string;
  deviceLabel: string;
  reference: string;
  email: string;
  username: string;
  amountKobo: number;
  currency: string;
  status: 'active' | 'revoked';
  unlockedAt: string;
  accessToken: string;
  verifiedVia: 'webhook' | 'paystack_verify' | 'admin_webhook';
}

export interface PaymentReferenceLock {
  reference: string;
  deviceId: string;
  hardwareSignature: string;
  deviceFingerprint: string;
  deviceSecretHash: string;
  compositeDeviceHash: string;
  deviceLabel: string;
  email: string;
  username: string;
  amountKobo: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  paidAt?: string;
  webhookReceivedAt?: string;
}

export interface WebhookLogEntry {
  id: string;
  event: string;
  reference: string;
  deviceId: string;
  email: string;
  amountKobo: number;
  signatureValid: boolean;
  outcome: string;
  receivedAt: string;
}

interface ServerStore {
  devices: Record<string, DeviceEntitlementRecord>;
  references: Record<string, PaymentReferenceLock>;
  webhookLogs: WebhookLogEntry[];
}

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        devices: parsed.devices || {},
        references: parsed.references || {},
        webhookLogs: parsed.webhookLogs || [],
      };
    }
  } catch (err) {
    console.warn('Could not read paystack-device-store.json, initializing empty store:', err);
  }
  return { devices: {}, references: {}, webhookLogs: [] };
}

function saveStore(store: ServerStore): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist paystack-device-store.json:', err);
  }
}

const store: ServerStore = loadStore();

function getPaystackSecretKey(): string {
  const key = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  return key.includes('xxxx') ? '' : key;
}

function getPaystackPublicKey(): string {
  const key = (process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '').trim();
  return key.includes('xxxx') ? '' : key;
}

function getStandardAmountNgn(): number {
  const parsed = Number(process.env.PAYSTACK_STANDARD_AMOUNT_NGN);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1500;
}

function getSigningSecret(): string {
  return getPaystackSecretKey() || process.env.GEMINI_API_KEY || 'jamb_cbt_single_device_hmac_secret_2027';
}

function computeAccessToken(deviceId: string, deviceFingerprint: string, deviceSecretHash: string, reference: string): string {
  return crypto
    .createHmac('sha256', getSigningSecret())
    .update(`${deviceId}|${deviceFingerprint}|${deviceSecretHash}|${reference}`)
    .digest('hex');
}

function normalizeDeviceParams(input: Record<string, any>) {
  const deviceId = String(input.deviceId || '').trim();
  const deviceFingerprint = String(
    input.deviceFingerprint || input.hardwareSignature || input.compositeDeviceHash || ''
  ).trim();
  const hardwareSignature = String(input.hardwareSignature || deviceFingerprint).trim();
  const deviceSecretHash = String(input.deviceSecretHash || '').trim();
  const compositeDeviceHash = String(
    input.compositeDeviceHash || `${deviceId}:${deviceFingerprint}:${deviceSecretHash}`
  ).trim();
  const deviceLabel = String(input.deviceLabel || deviceFingerprint || 'Candidate Device').trim();

  return {
    deviceId,
    deviceFingerprint,
    hardwareSignature,
    deviceSecretHash,
    compositeDeviceHash,
    deviceLabel,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Capture raw body for Paystack webhook HMAC-SHA512 verification
  app.use(
    express.json({
      limit: '5mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf-8');
      },
    })
  );

  // 1. Public Paystack & Pricing Configuration
  app.get('/api/paystack/config', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const appUrl = (process.env.APP_URL || `${protocol}://${host}`).replace(/\/$/, '');
    const amountNgn = getStandardAmountNgn();

    res.json({
      publicKey: getPaystackPublicKey(),
      hasSecretKey: Boolean(getPaystackSecretKey()),
      hasPublicKey: Boolean(getPaystackPublicKey()),
      amountNgn,
      amountKobo: amountNgn * 100,
      currency: 'NGN',
      webhookUrl: `${appUrl}/api/paystack/webhook`,
    });
  });

  // 2A. GET /api/paystack/device-status (Single-device lock verification)
  app.get('/api/paystack/device-status', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const appUrl = (process.env.APP_URL || `${protocol}://${host}`).replace(/\/$/, '');
    const webhookUrl = `${appUrl}/api/paystack/webhook`;
    const amountNgn = getStandardAmountNgn();
    const publicKey = getPaystackPublicKey();
    const hasLivePaystackKeys = Boolean(getPaystackSecretKey() || publicKey);

    const { deviceId, deviceFingerprint, deviceSecretHash } = normalizeDeviceParams(req.query);

    if (!deviceId || !deviceFingerprint || !deviceSecretHash) {
      res.json({
        hasStandardAccess: false,
        amountNgn,
        amountKobo: amountNgn * 100,
        webhookUrl,
        publicKey,
        hasLivePaystackKeys,
      });
      return;
    }

    const record = store.devices[deviceId];
    if (!record || record.status !== 'active') {
      res.json({
        hasStandardAccess: false,
        deviceId,
        amountNgn,
        amountKobo: amountNgn * 100,
        webhookUrl,
        publicKey,
        hasLivePaystackKeys,
      });
      return;
    }

    const matchesDevice =
      record.deviceId === deviceId &&
      record.deviceFingerprint === deviceFingerprint &&
      record.deviceSecretHash === deviceSecretHash;

    if (!matchesDevice) {
      res.json({
        hasStandardAccess: false,
        deviceId,
        securityAlert:
          'Device hardware signature mismatch. Access is strictly locked to the original paying device.',
        amountNgn,
        amountKobo: amountNgn * 100,
        webhookUrl,
        publicKey,
        hasLivePaystackKeys,
      });
      return;
    }

    res.json({
      hasStandardAccess: true,
      deviceId: record.deviceId,
      reference: record.reference,
      unlockedAt: record.unlockedAt,
      accessToken: record.accessToken,
      email: record.email,
      amountNgn,
      amountKobo: amountNgn * 100,
      webhookUrl,
      publicKey,
      hasLivePaystackKeys,
    });
  });

  // 2B. POST /api/paystack/access-status
  app.post('/api/paystack/access-status', (req, res) => {
    const { deviceId, deviceFingerprint, deviceSecretHash } = normalizeDeviceParams(req.body || {});

    if (!deviceId || !deviceFingerprint || !deviceSecretHash) {
      res.status(400).json({ unlocked: false, reason: 'Missing device cryptographic identity.' });
      return;
    }

    const record = store.devices[deviceId];
    if (!record || record.status !== 'active') {
      res.json({ unlocked: false });
      return;
    }

    const matchesDevice =
      record.deviceId === deviceId &&
      record.deviceFingerprint === deviceFingerprint &&
      record.deviceSecretHash === deviceSecretHash;

    if (!matchesDevice) {
      res.status(403).json({
        unlocked: false,
        reason: 'Device fingerprint mismatch. Access is strictly locked to the original paying device.',
      });
      return;
    }

    res.json({
      unlocked: true,
      accessRecord: record,
    });
  });

  // 3. Initialize Paystack Transaction & Pre-Lock Reference to this Device Alone
  app.post('/api/paystack/initialize', async (req, res) => {
    try {
      const { email, username } = req.body || {};
      const {
        deviceId,
        deviceFingerprint,
        hardwareSignature,
        deviceSecretHash,
        compositeDeviceHash,
        deviceLabel,
      } = normalizeDeviceParams(req.body || {});

      if (!deviceId || !deviceFingerprint || !deviceSecretHash) {
        res.status(400).json({
          error: 'Device fingerprint identity is required to initialize a single-device payment.',
        });
        return;
      }

      const cleanEmail = String(email || 'candidate@jamb-cbt.ng').trim();
      const cleanUsername = String(username || 'Candidate').trim();
      const amountNgn = getStandardAmountNgn();
      const amountKobo = amountNgn * 100;
      const reference = `JAMB_STD_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Pre-lock this payment reference to this exact device so no other device can ever claim it
      const refLock: PaymentReferenceLock = {
        reference,
        deviceId,
        hardwareSignature,
        deviceFingerprint,
        deviceSecretHash,
        compositeDeviceHash,
        deviceLabel,
        email: cleanEmail,
        username: cleanUsername,
        amountKobo,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      store.references[reference] = refLock;
      saveStore(store);

      const secretKey = getPaystackSecretKey();
      const publicKey = getPaystackPublicKey();

      // If PAYSTACK_SECRET_KEY is configured, initialize via official Paystack REST API
      if (secretKey) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
        const callbackUrl = `${protocol}://${host}/?paystack_ref=${encodeURIComponent(reference)}`;

        try {
          const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: cleanEmail,
              amount: amountKobo,
              reference,
              currency: 'NGN',
              callback_url: callbackUrl,
              metadata: {
                deviceId,
                deviceFingerprint,
                hardwareSignature,
                deviceSecretHash,
                compositeDeviceHash,
                deviceLabel,
                username: cleanUsername,
                plan: 'standard_jamb_single_device',
                custom_fields: [
                  {
                    display_name: 'Locked Device ID',
                    variable_name: 'device_id',
                    value: deviceId,
                  },
                  {
                    display_name: 'Candidate Username',
                    variable_name: 'username',
                    value: cleanUsername,
                  },
                ],
              },
            }),
          });

          const paystackData: any = await paystackRes.json();
          if (paystackRes.ok && paystackData?.status && paystackData?.data) {
            res.json({
              reference: paystackData.data.reference || reference,
              amountKobo,
              amountNgn,
              publicKey,
              authorizationUrl: paystackData.data.authorization_url,
              accessCode: paystackData.data.access_code,
              deviceId,
              mode: 'paystack_live',
            });
            return;
          }
        } catch (apiErr) {
          console.warn('Paystack API initialize warning:', apiErr);
        }
      }

      res.json({
        reference,
        amountKobo,
        amountNgn,
        publicKey,
        deviceId,
        mode: publicKey ? 'paystack_inline' : 'webhook_ready',
      });
    } catch (error: any) {
      console.error('Paystack initialize error:', error);
      res.status(500).json({ error: error?.message || 'Failed to initialize Paystack payment.' });
    }
  });

  // 4. Official Paystack Webhook Endpoint (POST /api/paystack/webhook)
  app.post('/api/paystack/webhook', (req: any, res) => {
    try {
      const secretKey = getPaystackSecretKey();
      const signature = String(req.headers['x-paystack-signature'] || '');
      const rawBody = req.rawBody || JSON.stringify(req.body || {});

      let signatureValid = false;
      if (secretKey) {
        const expectedHash = crypto
          .createHmac('sha512', secretKey)
          .update(rawBody)
          .digest('hex');
        signatureValid = Boolean(signature && expectedHash === signature);

        if (!signatureValid) {
          store.webhookLogs.unshift({
            id: `wh_${Date.now()}`,
            event: req.body?.event || 'unknown',
            reference: req.body?.data?.reference || 'unknown',
            deviceId: req.body?.data?.metadata?.deviceId || 'unknown',
            email: req.body?.data?.customer?.email || 'unknown',
            amountKobo: req.body?.data?.amount || 0,
            signatureValid: false,
            outcome: 'Rejected: Invalid x-paystack-signature',
            receivedAt: new Date().toISOString(),
          });
          store.webhookLogs = store.webhookLogs.slice(0, 100);
          saveStore(store);
          res.status(401).json({ error: 'Invalid Paystack webhook signature' });
          return;
        }
      } else {
        signatureValid = true;
      }

      const payload = req.body || {};
      const event = payload.event;
      const data = payload.data || {};
      const reference = String(data.reference || '').trim();
      const metadata = data.metadata || {};

      if (event === 'charge.success' && reference) {
        const existingLock = store.references[reference];
        const normMeta = normalizeDeviceParams(metadata);

        const targetDeviceId = normMeta.deviceId || existingLock?.deviceId || '';
        const targetFingerprint =
          normMeta.deviceFingerprint || existingLock?.deviceFingerprint || '';
        const targetSecretHash =
          normMeta.deviceSecretHash || existingLock?.deviceSecretHash || '';
        const targetCompositeHash =
          normMeta.compositeDeviceHash || existingLock?.compositeDeviceHash || '';

        if (!targetDeviceId || !targetFingerprint || !targetSecretHash) {
          store.webhookLogs.unshift({
            id: `wh_${Date.now()}`,
            event,
            reference,
            deviceId: 'missing',
            email: data.customer?.email || '',
            amountKobo: data.amount || 0,
            signatureValid,
            outcome: 'Ignored: Missing device binding metadata',
            receivedAt: new Date().toISOString(),
          });
          saveStore(store);
          res.status(200).json({ received: true, warning: 'Missing device metadata' });
          return;
        }

        // Prevent a single payment reference from ever unlocking a second device
        if (
          existingLock &&
          existingLock.status === 'success' &&
          (existingLock.deviceId !== targetDeviceId ||
            existingLock.deviceFingerprint !== targetFingerprint ||
            existingLock.deviceSecretHash !== targetSecretHash)
        ) {
          store.webhookLogs.unshift({
            id: `wh_${Date.now()}`,
            event,
            reference,
            deviceId: targetDeviceId,
            email: data.customer?.email || existingLock.email,
            amountKobo: data.amount || existingLock.amountKobo,
            signatureValid,
            outcome: `REJECTED Multi-Device Attempt: Reference already bound to ${existingLock.deviceId}`,
            receivedAt: new Date().toISOString(),
          });
          saveStore(store);
          res.status(200).json({ received: true, error: 'Reference already locked to another device' });
          return;
        }

        const nowIso = new Date().toISOString();
        const email = data.customer?.email || existingLock?.email || 'candidate@jamb.ng';
        const username = metadata.username || existingLock?.username || 'Candidate';
        const amountKobo = Number(data.amount || existingLock?.amountKobo || getStandardAmountNgn() * 100);
        const deviceLabel = normMeta.deviceLabel || existingLock?.deviceLabel || targetFingerprint;
        const accessToken = computeAccessToken(
          targetDeviceId,
          targetFingerprint,
          targetSecretHash,
          reference
        );

        store.references[reference] = {
          reference,
          deviceId: targetDeviceId,
          hardwareSignature: targetFingerprint,
          deviceFingerprint: targetFingerprint,
          deviceSecretHash: targetSecretHash,
          compositeDeviceHash: targetCompositeHash,
          deviceLabel,
          email,
          username,
          amountKobo,
          status: 'success',
          createdAt: existingLock?.createdAt || nowIso,
          paidAt: data.paid_at || nowIso,
          webhookReceivedAt: nowIso,
        };

        const entitlement: DeviceEntitlementRecord = {
          deviceId: targetDeviceId,
          hardwareSignature: targetFingerprint,
          deviceFingerprint: targetFingerprint,
          deviceSecretHash: targetSecretHash,
          compositeDeviceHash: targetCompositeHash,
          deviceLabel,
          reference,
          email,
          username,
          amountKobo,
          currency: data.currency || 'NGN',
          status: 'active',
          unlockedAt: nowIso,
          accessToken,
          verifiedVia: 'webhook',
        };

        store.devices[targetDeviceId] = entitlement;
        store.webhookLogs.unshift({
          id: `wh_${Date.now()}`,
          event,
          reference,
          deviceId: targetDeviceId,
          email,
          amountKobo,
          signatureValid,
          outcome: `Unlocked Standard JAMB strictly for device ${targetDeviceId}`,
          receivedAt: nowIso,
        });
        store.webhookLogs = store.webhookLogs.slice(0, 100);
        saveStore(store);

        res.status(200).json({
          received: true,
          status: 'device_unlocked',
          deviceId: targetDeviceId,
          reference,
          accessToken,
        });
        return;
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Paystack webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // 5. Verify Payment Reference & Enforce Strict Single-Device Lock
  app.post('/api/paystack/verify', async (req, res) => {
    try {
      const { reference, email, username } = req.body || {};
      const {
        deviceId,
        deviceFingerprint,
        deviceSecretHash,
        compositeDeviceHash,
        deviceLabel,
      } = normalizeDeviceParams(req.body || {});

      if (!reference || !deviceId || !deviceFingerprint || !deviceSecretHash) {
        res.status(400).json({
          error: 'Payment reference and complete device cryptographic fingerprint are required.',
        });
        return;
      }

      const cleanRef = String(reference).trim();
      const existingLock = store.references[cleanRef];

      // STRICT ANTI-SHARING CHECK: If reference exists and belongs to a different device, reject immediately!
      if (
        existingLock &&
        (existingLock.deviceId !== deviceId ||
          existingLock.deviceFingerprint !== deviceFingerprint ||
          existingLock.deviceSecretHash !== deviceSecretHash)
      ) {
        store.webhookLogs.unshift({
          id: `wh_${Date.now()}`,
          event: 'verify.multi_device_blocked',
          reference: cleanRef,
          deviceId,
          email: email || existingLock.email,
          amountKobo: existingLock.amountKobo,
          signatureValid: true,
          outcome: `REJECTED: Device ${deviceId} attempted to use payment locked to ${existingLock.deviceId}`,
          receivedAt: new Date().toISOString(),
        });
        saveStore(store);

        res.status(403).json({
          unlocked: false,
          verified: false,
          error:
            'ACCESS DENIED: This payment reference is permanently bound to another device. A single payment cannot be shared across multiple devices.',
        });
        return;
      }

      // Check if webhook already unlocked this exact device
      if (existingLock && existingLock.status === 'success' && store.devices[deviceId]?.status === 'active') {
        const ent = store.devices[deviceId];
        res.json({
          unlocked: true,
          verified: true,
          reference: cleanRef,
          deviceId,
          accessToken: ent.accessToken,
          unlockedAt: ent.unlockedAt,
          accessRecord: ent,
        });
        return;
      }

      const secretKey = getPaystackSecretKey();
      if (secretKey) {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(cleanRef)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const verifyData: any = await verifyRes.json();
        if (!verifyRes.ok || !verifyData?.status || verifyData?.data?.status !== 'success') {
          res.status(400).json({
            unlocked: false,
            verified: false,
            error:
              verifyData?.data?.gateway_response ||
              verifyData?.message ||
              'Payment has not been confirmed by Paystack yet.',
          });
          return;
        }

        const txMeta = normalizeDeviceParams(verifyData.data.metadata || {});
        if (
          txMeta.deviceId &&
          (txMeta.deviceId !== deviceId ||
            (txMeta.deviceFingerprint && txMeta.deviceFingerprint !== deviceFingerprint))
        ) {
          res.status(403).json({
            unlocked: false,
            verified: false,
            error:
              'ACCESS DENIED: Paystack transaction metadata belongs to a different device. Single payment cannot be used on multiple devices.',
          });
          return;
        }

        const nowIso = new Date().toISOString();
        const amountKobo = Number(verifyData.data.amount || getStandardAmountNgn() * 100);
        const verifiedEmail = verifyData.data.customer?.email || email || 'candidate@jamb.ng';
        const accessToken = computeAccessToken(deviceId, deviceFingerprint, deviceSecretHash, cleanRef);

        store.references[cleanRef] = {
          reference: cleanRef,
          deviceId,
          hardwareSignature: deviceFingerprint,
          deviceFingerprint,
          deviceSecretHash,
          compositeDeviceHash,
          deviceLabel,
          email: verifiedEmail,
          username: username || verifyData.data.metadata?.username || 'Candidate',
          amountKobo,
          status: 'success',
          createdAt: existingLock?.createdAt || nowIso,
          paidAt: verifyData.data.paid_at || nowIso,
          webhookReceivedAt: nowIso,
        };

        const entitlement: DeviceEntitlementRecord = {
          deviceId,
          hardwareSignature: deviceFingerprint,
          deviceFingerprint,
          deviceSecretHash,
          compositeDeviceHash,
          deviceLabel,
          reference: cleanRef,
          email: verifiedEmail,
          username: username || verifyData.data.metadata?.username || 'Candidate',
          amountKobo,
          currency: verifyData.data.currency || 'NGN',
          status: 'active',
          unlockedAt: nowIso,
          accessToken,
          verifiedVia: 'paystack_verify',
        };

        store.devices[deviceId] = entitlement;
        store.webhookLogs.unshift({
          id: `wh_${Date.now()}`,
          event: 'charge.success (verified)',
          reference: cleanRef,
          deviceId,
          email: verifiedEmail,
          amountKobo,
          signatureValid: true,
          outcome: `Verified with Paystack API & locked strictly to device ${deviceId}`,
          receivedAt: nowIso,
        });
        saveStore(store);

        res.json({
          unlocked: true,
          verified: true,
          reference: cleanRef,
          deviceId,
          accessToken,
          unlockedAt: nowIso,
          accessRecord: entitlement,
        });
        return;
      }

      res.status(400).json({
        unlocked: false,
        verified: false,
        error: 'Awaiting Paystack webhook confirmation (POST /api/paystack/webhook) for this reference.',
      });
    } catch (error: any) {
      console.error('Paystack verify error:', error);
      res.status(500).json({ error: error?.message || 'Verification failed' });
    }
  });

  // 6. Admin Overview of Webhooks & Locked Devices
  const handleAdminOverview = (req: express.Request, res: express.Response) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const appUrl = (process.env.APP_URL || `${protocol}://${host}`).replace(/\/$/, '');

    res.json({
      webhookUrl: `${appUrl}/api/paystack/webhook`,
      hasSecretKey: Boolean(getPaystackSecretKey()),
      hasPublicKey: Boolean(getPaystackPublicKey()),
      amountNgn: getStandardAmountNgn(),
      devices: Object.values(store.devices),
      references: Object.values(store.references),
      webhookLogs: store.webhookLogs,
    });
  };
  app.get('/api/paystack/admin/overview', handleAdminOverview);
  app.get('/api/paystack/admin-records', handleAdminOverview);

  // 7. Webhook dispatch helper for testing / confirming webhook verification
  const handleWebhookDispatch = (req: express.Request, res: express.Response) => {
    const { reference, email, username } = req.body || {};
    const {
      deviceId,
      deviceFingerprint,
      deviceSecretHash,
      compositeDeviceHash,
      deviceLabel,
    } = normalizeDeviceParams(req.body || {});

    if (!reference || !deviceId || !deviceFingerprint || !deviceSecretHash) {
      res.status(400).json({ error: 'Missing required device and reference parameters for webhook.' });
      return;
    }

    const cleanRef = String(reference).trim();
    const existingLock = store.references[cleanRef];
    if (
      existingLock &&
      (existingLock.deviceId !== deviceId ||
        existingLock.deviceFingerprint !== deviceFingerprint ||
        existingLock.deviceSecretHash !== deviceSecretHash)
    ) {
      res.status(403).json({
        error: 'ACCESS DENIED: Payment reference is already locked to another device.',
      });
      return;
    }

    const nowIso = new Date().toISOString();
    const amountKobo = getStandardAmountNgn() * 100;
    const accessToken = computeAccessToken(deviceId, deviceFingerprint, deviceSecretHash, cleanRef);

    store.references[cleanRef] = {
      reference: cleanRef,
      deviceId,
      hardwareSignature: deviceFingerprint,
      deviceFingerprint,
      deviceSecretHash,
      compositeDeviceHash,
      deviceLabel,
      email: email || existingLock?.email || 'candidate@jamb.ng',
      username: username || existingLock?.username || 'Candidate',
      amountKobo,
      status: 'success',
      createdAt: existingLock?.createdAt || nowIso,
      paidAt: nowIso,
      webhookReceivedAt: nowIso,
    };

    const entitlement: DeviceEntitlementRecord = {
      deviceId,
      hardwareSignature: deviceFingerprint,
      deviceFingerprint,
      deviceSecretHash,
      compositeDeviceHash,
      deviceLabel,
      reference: cleanRef,
      email: email || existingLock?.email || 'candidate@jamb.ng',
      username: username || existingLock?.username || 'Candidate',
      amountKobo,
      currency: 'NGN',
      status: 'active',
      unlockedAt: nowIso,
      accessToken,
      verifiedVia: 'webhook',
    };

    store.devices[deviceId] = entitlement;
    store.webhookLogs.unshift({
      id: `wh_${Date.now()}`,
      event: 'charge.success',
      reference: cleanRef,
      deviceId,
      email: entitlement.email,
      amountKobo,
      signatureValid: true,
      outcome: `Webhook charge.success processed: Device ${deviceId} unlocked exclusively`,
      receivedAt: nowIso,
    });
    store.webhookLogs = store.webhookLogs.slice(0, 100);
    saveStore(store);

    res.json({
      unlocked: true,
      verified: true,
      reference: cleanRef,
      deviceId,
      accessToken,
      unlockedAt: nowIso,
      accessRecord: entitlement,
    });
  };
  app.post('/api/paystack/webhook-dispatch', handleWebhookDispatch);
  app.post('/api/paystack/dispatch-webhook', handleWebhookDispatch);

  // ---------------- Questions Bank (JSON File Storage) ----------------
  const QUESTIONS_FILE = fs.existsSync('/data/questions.json') ? '/data/questions.json' : path.join(__dirname, 'data', 'questions.json');
  const ARTICLES_FILE = fs.existsSync('/data/articles.json') ? '/data/articles.json' : path.join(__dirname, 'data', 'articles.json');

  function ensureDataDir(): void {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // In-Memory Questions Cache & Index for Zero-Delay Instant Access
  let questionsCache: any[] | null = null;
  let questionsFileMtime: number = 0;
  let subjectIndexMap = new Map<string, any[]>();

  function normalizeSubj(raw: string): string {
    const clean = (raw || '').trim().toLowerCase();
    if (!clean) return 'english';
    if (clean === 'eng' || clean.includes('english')) return 'english';
    if (clean === 'mth' || clean === 'math' || clean === 'maths' || clean.includes('mathematic')) return 'mathematics';
    if (clean === 'phy' || clean.includes('physic')) return 'physics';
    if (clean === 'chm' || clean === 'chem' || clean.includes('chemist')) return 'chemistry';
    if (clean === 'bio' || clean.includes('biolog')) return 'biology';
    if (clean === 'eco' || clean === 'econ' || clean.includes('economic')) return 'economics';
    if (clean === 'gov' || clean === 'govt' || clean.includes('government')) return 'government';
    if (clean === 'lit' || clean.includes('literature')) return 'literature';
    if (clean === 'tlc' || clean.includes('life changer') || clean.includes('life_changer')) return 'life_changer';
    if (clean === 'com' || clean.includes('commerce')) return 'commerce';
    if (clean === 'acc' || clean.includes('account')) return 'accounts';
    if (clean === 'agr' || clean.includes('agric')) return 'agriculture';
    if (clean === 'crk' || clean === 'crs' || clean.includes('christian')) return 'crk';
    if (clean === 'geo' || clean.includes('geograph')) return 'geography';
    if (clean === 'frn' || clean.includes('french')) return 'french';
    if (clean === 'his' || clean.includes('histor')) return 'history';
    if (clean === 'art' || clean.includes('fine art') || clean.includes('fine_art')) return 'fine_art';
    if (clean === 'hau' || clean.includes('hausa')) return 'hausa';
    if (clean === 'arb' || clean.includes('arabic')) return 'arabic';
    return clean.replace(/\s+/g, '_');
  }

  function indexQuestionsInMemory(questions: any[]): void {
    questionsCache = questions;
    const newMap = new Map<string, any[]>();
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q || q.active === false) continue;
      const sId = normalizeSubj(q.subjectId || q.subject || '');
      let list = newMap.get(sId);
      if (!list) {
        list = [];
        newMap.set(sId, list);
      }
      list.push(q);
    }
    subjectIndexMap = newMap;
  }

  function readQuestions(): any[] {
    try {
      ensureDataDir();
      if (!fs.existsSync(QUESTIONS_FILE)) {
        fs.writeFileSync(QUESTIONS_FILE, '[]', 'utf-8');
        indexQuestionsInMemory([]);
        questionsFileMtime = 0;
        return [];
      }
      const stat = fs.statSync(QUESTIONS_FILE);
      if (questionsCache !== null && stat.mtimeMs === questionsFileMtime) {
        return questionsCache;
      }
      questionsFileMtime = stat.mtimeMs;
      const raw = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        // Fallback for trailing commas in user-uploaded JSON
        const cleaned = raw.replace(/,\s*([\]}])/g, '$1');
        parsed = JSON.parse(cleaned);
      }
      const list = Array.isArray(parsed) ? parsed : [];
      indexQuestionsInMemory(list);
      return list;
    } catch (err) {
      console.warn('Error reading questions.json:', err);
      if (questionsCache !== null) return questionsCache;
      indexQuestionsInMemory([]);
      return [];
    }
  }

  function writeQuestions(questions: any[]): void {
    indexQuestionsInMemory(questions);
    try {
      ensureDataDir();
      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing questions.json:', err);
      throw err;
    }
  }

  function readArticles(): any[] {
    try {
      ensureDataDir();
      if (!fs.existsSync(ARTICLES_FILE)) {
        return [];
      }
      const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (parseErr) {
        // Fallback for trailing commas in user-uploaded articles.json
        const cleaned = raw.replace(/,\s*([\]}])/g, '$1');
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (err) {
      console.warn('Error reading articles.json:', err);
      return [];
    }
  }

  function writeArticles(articles: any[]): void {
    try {
      ensureDataDir();
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing articles.json:', err);
      throw err;
    }
  }

  // Pre-load questions into memory on startup
  setTimeout(() => {
    try {
      readQuestions();
      console.log(`[Memory Cache] Questions indexed: ${questionsCache?.length || 0}`);
    } catch (e) {
      console.warn('Startup question indexing warning:', e);
    }
  }, 50);

  // GET /api/questions/download - Download full questions.json dataset
  app.get('/api/questions/download', (_req, res) => {
    try {
      ensureDataDir();
      if (!fs.existsSync(QUESTIONS_FILE)) {
        res.status(404).json({ error: 'questions.json not found' });
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="questions.json"');
      fs.createReadStream(QUESTIONS_FILE).pipe(res);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to download questions file' });
    }
  });

  // GET /api/questions (filter by subject or countOnly optional, zero-delay from memory)
  app.get('/api/questions', (req, res) => {
    try {
      const { subject, countOnly, limit, offset } = req.query;
      const all = readQuestions();

      if (countOnly === 'true') {
        res.json({ total: all.length });
        return;
      }

      let filtered = all;
      if (subject && typeof subject === 'string') {
        const canonical = normalizeSubj(subject);
        filtered = subjectIndexMap.get(canonical) || [];
      }

      const total = filtered.length;
      if (limit) {
        const start = parseInt(String(offset || '0'), 10) || 0;
        const lim = parseInt(String(limit), 10) || 50;
        filtered = filtered.slice(start, start + lim);
      }

      res.json({
        total,
        questions: filtered,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to fetch questions' });
    }
  });

  // POST /api/exam/prepare - ULTRA-FAST INSTANT EXAM GENERATOR (Zero lag)
  app.post('/api/exam/prepare', (req, res) => {
    try {
      const { subjectConfigs, shuffleQuestions = true, shuffleOptions = true } = req.body || {};
      readQuestions(); // ensure in memory

      if (!Array.isArray(subjectConfigs) || subjectConfigs.length === 0) {
        res.status(400).json({ error: 'subjectConfigs array is required' });
        return;
      }

      const result: any[] = [];
      const sessionSeenIds = new Set<string>();

      for (const config of subjectConfigs) {
        const canonical = normalizeSubj(config.subjectId);
        const available = (subjectIndexMap.get(canonical) || []).filter((q) => {
          const id = String(q.id || '').trim();
          return !sessionSeenIds.has(id);
        });

        const countNeeded = Number(config.questionCount) || 1;
        let pool = [...available];

        if (shuffleQuestions) {
          // In-place Fisher-Yates
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
        }

        const chosen = pool.slice(0, countNeeded);

        for (const rawQ of chosen) {
          const id = String(rawQ.id || '');
          sessionSeenIds.add(id);

          const qOptions = Array.isArray(rawQ.options) ? [...rawQ.options] : [];
          while (qOptions.length < 4) {
            qOptions.push(`Option ${String.fromCharCode(65 + qOptions.length)}`);
          }

          let displayOptions = [...qOptions];
          let originalIndicesMap = [0, 1, 2, 3];

          if (shuffleOptions) {
            const indexed = displayOptions.map((opt, idx) => ({ opt, originalIdx: idx }));
            for (let i = indexed.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
            }
            displayOptions = indexed.map((item) => item.opt);
            originalIndicesMap = indexed.map((item) => item.originalIdx);
          }

          result.push({
            question: {
              id: rawQ.id,
              subjectId: canonical,
              subjectName: rawQ.subjectName || rawQ.subject || config.subjectName || canonical,
              questionText: rawQ.questionText || rawQ.question || '',
              options: qOptions,
              correctAnswerIndex: typeof rawQ.correctAnswerIndex === 'number' ? rawQ.correctAnswerIndex : 0,
              solution: rawQ.solution || rawQ.explanation || '',
              passage: rawQ.passage,
              year: rawQ.year || 'JAMB UTME',
              examType: rawQ.examType || 'JAMB UTME',
              active: true,
            },
            displayOptions,
            originalIndicesMap,
          });
        }
      }

      res.json({
        success: true,
        total: result.length,
        questions: result,
      });
    } catch (error: any) {
      console.error('Error in /api/exam/prepare:', error);
      res.status(500).json({ error: error?.message || 'Failed to prepare questions' });
    }
  });

  // POST /api/questions (add single question following user schema)
  app.post('/api/questions', (req, res) => {
    try {
      const body = req.body || {};
      const questions = readQuestions();

      const newQ = {
        id: String(body.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
        subject: String(body.subject || body.subjectId || 'english').trim().toLowerCase(),
        subjectId: String(body.subjectId || body.subject || 'english').trim().toLowerCase(),
        question: String(body.question || body.questionText || '').trim(),
        questionText: String(body.questionText || body.question || '').trim(),
        options: Array.isArray(body.options) ? body.options : [],
        correctAnswer: String(body.correctAnswer || (body.options && body.options[body.correctAnswerIndex]) || ''),
        correctAnswerIndex: typeof body.correctAnswerIndex === 'number' ? body.correctAnswerIndex : 0,
        explanation: String(body.explanation || body.solution || ''),
        solution: String(body.solution || body.explanation || ''),
        year: body.year || 'JAMB 2027',
        active: body.active !== false,
        createdAt: body.createdAt || new Date().toISOString(),
      };

      if (!newQ.questionText || newQ.options.length < 2) {
        res.status(400).json({ error: 'Question requires questionText and at least 2 options' });
        return;
      }

      // Check if duplicate ID exists, replace or append
      const existingIdx = questions.findIndex((q) => q.id === newQ.id);
      if (existingIdx >= 0) {
        questions[existingIdx] = newQ;
      } else {
        questions.push(newQ);
      }

      writeQuestions(questions);
      res.json({ success: true, question: newQ, total: questions.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to save question' });
    }
  });

  // POST /api/questions/bulk (bulk import JSON dataset or paste)
  app.post('/api/questions/bulk', (req, res) => {
    try {
      const { items, replaceAll } = req.body || {};
      if (!Array.isArray(items)) {
        res.status(400).json({ error: 'Payload must include an "items" array of question objects' });
        return;
      }

      let currentList = replaceAll ? [] : readQuestions();
      const existingIds = new Set(currentList.map((q) => q.id));

      let addedCount = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        const qText = String(item.question || item.questionText || '').trim();
        if (!qText) continue;

        let options: string[] = [];
        if (Array.isArray(item.options)) {
          options = item.options.map((o: any) => String(o ?? ''));
        } else if (item.options && typeof item.options === 'object') {
          options = [
            String(item.options.A ?? item.options.a ?? ''),
            String(item.options.B ?? item.options.b ?? ''),
            String(item.options.C ?? item.options.c ?? ''),
            String(item.options.D ?? item.options.d ?? ''),
          ].filter(Boolean);
        }

        if (options.length < 2) continue;

        let corrIdx = 0;
        if (typeof item.correctAnswerIndex === 'number' && item.correctAnswerIndex >= 0 && item.correctAnswerIndex < options.length) {
          corrIdx = item.correctAnswerIndex;
        } else if (typeof item.correctAnswer === 'string') {
          const match = options.findIndex((opt) => opt.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase());
          if (match >= 0) corrIdx = match;
        }

        const id = String(item.id || `q_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`);
        const sub = String(item.subject || item.subjectId || 'general').trim().toLowerCase();

        const formatted = {
          id,
          subject: sub,
          subjectId: sub,
          question: qText,
          questionText: qText,
          options,
          correctAnswer: options[corrIdx] || item.correctAnswer || '',
          correctAnswerIndex: corrIdx,
          explanation: String(item.explanation || item.solution || ''),
          solution: String(item.solution || item.explanation || ''),
          year: item.year || 'JAMB UTME',
          active: true,
          createdAt: item.createdAt || new Date().toISOString(),
        };

        if (existingIds.has(id)) {
          const idx = currentList.findIndex((q) => q.id === id);
          if (idx >= 0) currentList[idx] = formatted;
        } else {
          currentList.push(formatted);
          existingIds.add(id);
          addedCount++;
        }
      }

      writeQuestions(currentList);
      res.json({
        success: true,
        added: addedCount,
        total: currentList.length,
        message: `Successfully processed ${items.length} items. Total questions in bank: ${currentList.length}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Bulk import failed' });
    }
  });

  // DELETE /api/questions/empty (empty and delete all questions from the JSON bank)
  app.delete('/api/questions/empty', (req, res) => {
    try {
      writeQuestions([]);
      res.json({ success: true, message: 'Question bank has been completely emptied and deleted.', total: 0 });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to empty question bank' });
    }
  });

  // DELETE /api/questions/:id
  app.delete('/api/questions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readQuestions();
      const filtered = current.filter((q) => q.id !== id);
      writeQuestions(filtered);
      res.json({ success: true, remaining: filtered.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete question' });
    }
  });

  // ---------------- Content & Articles (Dynamic Unique URLs for AdSense) ----------------
  app.get('/api/articles', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const articles = readArticles();
      res.json({ articles, total: articles.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to fetch articles' });
    }
  });

  app.post('/api/articles', (req, res) => {
    try {
      const body = req.body || {};
      const articles = readArticles();
      const slug = String(body.slug || body.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (!slug || !body.title) {
        res.status(400).json({ error: 'Article requires title and content' });
        return;
      }

      const newArticle = {
        id: String(body.id || `art_${Date.now()}`),
        slug,
        title: String(body.title).trim(),
        subjectId: String(body.subjectId || 'general').trim().toLowerCase(),
        subjectName: String(body.subjectName || 'General Studies').trim(),
        topicName: String(body.topicName || body.title).trim(),
        excerpt: String(body.excerpt || '').trim(),
        content: String(body.content || '').trim(),
        chapters: Array.isArray(body.chapters) ? body.chapters : undefined,
        author: String(body.author || 'Teramayo Academic Team').trim(),
        readTimeMinutes: Number(body.readTimeMinutes || 6),
        keywords: Array.isArray(body.keywords) ? body.keywords : ['JAMB UTME', 'Study Guide', 'CBT'],
        datePublished: body.datePublished || new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      const existingIdx = articles.findIndex((a) => a.slug === slug || a.id === newArticle.id);
      if (existingIdx >= 0) {
        articles[existingIdx] = newArticle;
      } else {
        articles.unshift(newArticle);
      }

      writeArticles(articles);
      res.json({ success: true, article: newArticle, total: articles.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to save article' });
    }
  });

  // DELETE /api/articles/:id (admin delete study material)
  app.delete('/api/articles/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readArticles();
      const filtered = current.filter((a) => a.id !== id && a.slug !== id);
      writeArticles(filtered);
      res.json({ success: true, remaining: filtered.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete article' });
    }
  });

  // Vite middleware in development, static dist in production with secure caching
  const distPath = path.join(__dirname, 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.includes('/assets/')) {
            // Immutable hashed JavaScript, CSS, and media bundles
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (filePath.endsWith('sw.js') || filePath.endsWith('registerSW.js')) {
            // Service worker must never be stale
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          } else if (filePath.endsWith('.webmanifest') || filePath.endsWith('manifest.json')) {
            res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
          } else if (filePath.endsWith('.png') || filePath.endsWith('.svg') || filePath.endsWith('.ico')) {
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
          }
        },
      })
    );

    app.get('*', (_req, res) => {
      // index.html must revalidate so clients immediately discover app deployments
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
