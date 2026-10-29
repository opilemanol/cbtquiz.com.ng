import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AttemptTier } from '../types';

const DEVICE_ID_STORAGE_KEY = 'jamb_cbt_device_uid_v1';
const DEVICE_SECRET_STORAGE_KEY = 'jamb_cbt_device_secret_v1';
const DEVICE_ACCESS_TOKEN_KEY = 'jamb_cbt_device_access_token_v1';
const DEVICE_REFERENCE_KEY = 'jamb_cbt_device_tx_ref_v1';

const DEVICE_ACCESS_COLLECTION = 'deviceAccess';
const TRANSACTIONS_COLLECTION = 'paymentTransactions';

export interface DeviceIdentity {
  deviceId: string;
  deviceFingerprint: string;
  deviceSecretHash: string;
}

export interface DeviceAccessStatus {
  hasStandardAccess: boolean;
  deviceId: string;
  reference?: string;
  unlockedAt?: string;
  amountNgn: number;
  amountKobo: number;
  webhookUrl: string;
  publicKey?: string;
  hasLivePaystackKeys?: boolean;
  securityAlert?: string;
}

/**
 * Compute a deterministic hash string using FNV-1a / SHA-like bit mixing
 */
function hashString(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Generate hardware + browser fingerprint specific to this physical device
 */
function computeHardwareFingerprint(): string {
  const nav = window.navigator;
  const scr = window.screen;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  let canvasSig = 'no_canvas';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 36;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '13px Arial';
      ctx.fillStyle = '#1e5622';
      ctx.fillRect(10, 4, 60, 20);
      ctx.fillStyle = '#28a745';
      ctx.fillText('JAMB-CBT-LOCK', 6, 8);
      canvasSig = hashString(canvas.toDataURL());
    }
  } catch {
    // ignore canvas error
  }

  const rawSignals = [
    nav.userAgent || '',
    nav.language || '',
    nav.platform || '',
    String(nav.hardwareConcurrency || 0),
    String(nav.maxTouchPoints || 0),
    `${scr.width}x${scr.height}x${scr.colorDepth}`,
    tz,
    canvasSig,
  ].join('||');

  return `FP_${hashString(rawSignals).toUpperCase()}_${hashString(rawSignals + '_SALT').toUpperCase()}`;
}

/**
 * Returns the current device's unique cryptographic identity.
 * Ensures a single payment unlocked on this device cannot be transferred to any other device.
 */
export function getDeviceIdentity(): DeviceIdentity {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) {
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    deviceId = `DEV-${randomPart}`;
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }

  let deviceSecret = localStorage.getItem(DEVICE_SECRET_STORAGE_KEY);
  if (!deviceSecret) {
    const secretBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    deviceSecret = `sec_${secretBytes}`;
    localStorage.setItem(DEVICE_SECRET_STORAGE_KEY, deviceSecret);
  }

  const deviceFingerprint = computeHardwareFingerprint();
  const deviceSecretHash = hashString(`${deviceId}:${deviceSecret}:${deviceFingerprint}`).toUpperCase();

  return {
    deviceId,
    deviceFingerprint,
    deviceSecretHash,
  };
}

export function getQuestionCountForTier(subjectId: string, tier: AttemptTier, customCount?: number): number {
  if (tier === 'free') {
    // Quick Drill mode: 10 questions per subject for swift revision
    return customCount || 10;
  }
  // Standard full JAMB UTME allocation: 60 for English, 40 for other subjects (100% Free)
  return customCount || (subjectId.toLowerCase() === 'english' ? 60 : 40);
}

/**
 * Verify device access status. Unlocked 100% free for all candidates.
 */
export async function checkDeviceStandardAccess(): Promise<DeviceAccessStatus> {
  const identity = getDeviceIdentity();
  return {
    hasStandardAccess: true,
    deviceId: identity.deviceId,
    amountNgn: 0,
    amountKobo: 0,
    webhookUrl: `${window.location.origin}/api/paystack/webhook`,
  };
}


/**
 * Initialize a single-device locked Paystack transaction
 */
export async function initializeDevicePayment(email: string, username: string): Promise<{
  reference: string;
  amountNgn: number;
  amountKobo: number;
  publicKey: string;
  authorizationUrl?: string;
  accessCode?: string;
  deviceId: string;
}> {
  const identity = getDeviceIdentity();

  const res = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      username,
      deviceId: identity.deviceId,
      deviceFingerprint: identity.deviceFingerprint,
      deviceSecretHash: identity.deviceSecretHash,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not initialize Paystack payment');
  }

  // Also record pending transaction binding in Firestore so no other device can ever claim this reference
  try {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, data.reference), {
      reference: data.reference,
      email,
      username,
      amountKobo: data.amountKobo,
      deviceId: identity.deviceId,
      deviceFingerprint: identity.deviceFingerprint,
      deviceSecretHash: identity.deviceSecretHash,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch {
    // non-fatal if Firestore offline
  }

  return {
    reference: data.reference,
    amountNgn: data.amountNgn || 1500,
    amountKobo: data.amountKobo || 150000,
    publicKey: data.publicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    authorizationUrl: data.authorizationUrl,
    accessCode: data.accessCode,
    deviceId: identity.deviceId,
  };
}

/**
 * Verify a payment reference strictly for the current device.
 * Rejects if the payment reference was initiated or used on any other device.
 */
export async function verifyDevicePaymentReference(reference: string): Promise<{
  verified: boolean;
  reference: string;
  deviceId: string;
  unlockedAt?: string;
}> {
  const cleanRef = reference.trim();
  const identity = getDeviceIdentity();

  // First check Firestore to see if this reference is already bound to a different device
  try {
    const txSnap = await getDoc(doc(db, TRANSACTIONS_COLLECTION, cleanRef));
    if (txSnap.exists()) {
      const txData = txSnap.data();
      if (
        txData.deviceId &&
        (txData.deviceId !== identity.deviceId ||
          txData.deviceFingerprint !== identity.deviceFingerprint ||
          txData.deviceSecretHash !== identity.deviceSecretHash)
      ) {
        throw new Error(
          'ACCESS DENIED: This payment reference is permanently locked to another device. A single payment cannot be used across multiple devices.'
        );
      }
    }
  } catch (e: any) {
    if (e?.message?.includes('ACCESS DENIED')) {
      throw e;
    }
  }

  const res = await fetch('/api/paystack/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reference: cleanRef,
      deviceId: identity.deviceId,
      deviceFingerprint: identity.deviceFingerprint,
      deviceSecretHash: identity.deviceSecretHash,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify payment reference for this device.');
  }

  if (data.accessToken) {
    localStorage.setItem(DEVICE_ACCESS_TOKEN_KEY, data.accessToken);
  }
  localStorage.setItem(DEVICE_REFERENCE_KEY, cleanRef);

  // Persist single-device lock in Firestore
  try {
    const now = data.unlockedAt || new Date().toISOString();
    await setDoc(
      doc(db, TRANSACTIONS_COLLECTION, cleanRef),
      {
        reference: cleanRef,
        deviceId: identity.deviceId,
        deviceFingerprint: identity.deviceFingerprint,
        deviceSecretHash: identity.deviceSecretHash,
        status: 'success',
        webhookVerified: true,
        verifiedAt: now,
      },
      { merge: true }
    );

    await setDoc(doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId), {
      deviceId: identity.deviceId,
      deviceFingerprint: identity.deviceFingerprint,
      deviceSecretHash: identity.deviceSecretHash,
      reference: cleanRef,
      status: 'unlocked',
      unlockedAt: now,
    });
  } catch {
    // ignore Firestore offline error
  }

  return {
    verified: true,
    reference: cleanRef,
    deviceId: identity.deviceId,
    unlockedAt: data.unlockedAt,
  };
}

/**
 * Complete webhook confirmation for a transaction initiated on this exact device
 */
export async function completePaystackWebhookForDevice(
  reference: string,
  email: string,
  username: string
): Promise<{
  verified: boolean;
  reference: string;
  deviceId: string;
  unlockedAt: string;
}> {
  const identity = getDeviceIdentity();

  const res = await fetch('/api/paystack/dispatch-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reference,
      email,
      username,
      deviceId: identity.deviceId,
      deviceFingerprint: identity.deviceFingerprint,
      deviceSecretHash: identity.deviceSecretHash,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Webhook verification failed');
  }

  if (data.accessToken) {
    localStorage.setItem(DEVICE_ACCESS_TOKEN_KEY, data.accessToken);
  }
  localStorage.setItem(DEVICE_REFERENCE_KEY, reference);

  const now = data.unlockedAt || new Date().toISOString();
  try {
    await setDoc(
      doc(db, TRANSACTIONS_COLLECTION, reference),
      {
        reference,
        email,
        username,
        deviceId: identity.deviceId,
        deviceFingerprint: identity.deviceFingerprint,
        deviceSecretHash: identity.deviceSecretHash,
        status: 'success',
        webhookVerified: true,
        verifiedAt: now,
      },
      { merge: true }
    );

    await setDoc(doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId), {
      deviceId: identity.deviceId,
      deviceFingerprint: identity.deviceFingerprint,
      deviceSecretHash: identity.deviceSecretHash,
      reference,
      email,
      username,
      status: 'unlocked',
      unlockedAt: now,
    });
  } catch {
    // ignore
  }

  return {
    verified: true,
    reference,
    deviceId: identity.deviceId,
    unlockedAt: now,
  };
}
