import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface DeviceIdentity {
  deviceId: string;
  hardwareSignature: string;
  deviceSecretHash: string;
  compositeDeviceHash: string;
  deviceLabel: string;
}

export interface DeviceAccessStatus {
  unlocked: boolean;
  reference?: string;
  email?: string;
  unlockedAt?: string;
  deviceId: string;
  deviceLabel: string;
  reason?: string;
}

const DEVICE_ID_KEY = 'jamb_cbt_device_id_v1';
const DEVICE_SECRET_KEY = 'jamb_cbt_device_secret_v1';
const IDB_NAME = 'JambCbtDeviceVault';
const IDB_STORE = 'device_keys';

const DEVICE_ACCESS_COLLECTION = 'deviceAccess';
const PAYMENT_WEBHOOKS_COLLECTION = 'paymentWebhooks';

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomHex(bytes = 24): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readFromIndexedDB(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const dbInstance = request.result;
        if (!dbInstance.objectStoreNames.contains(IDB_STORE)) {
          dbInstance.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => {
        try {
          const dbInstance = request.result;
          const tx = dbInstance.transaction(IDB_STORE, 'readonly');
          const store = tx.objectStore(IDB_STORE);
          const getReq = store.get(key);
          getReq.onsuccess = () => resolve((getReq.result as string) || null);
          getReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function writeToIndexedDB(key: string, value: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const dbInstance = request.result;
        if (!dbInstance.objectStoreNames.contains(IDB_STORE)) {
          dbInstance.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => {
        try {
          const dbInstance = request.result;
          const tx = dbInstance.transaction(IDB_STORE, 'readwrite');
          const store = tx.objectStore(IDB_STORE);
          store.put(value, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function getWebGLSignature(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return 'no-webgl';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'webgl-basic';
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}::${renderer}`;
  } catch {
    return 'webgl-err';
  }
}

function getReadableDeviceLabel(): string {
  const ua = navigator.userAgent || '';
  let os = 'Desktop';
  if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'Mac';
  else if (/Android/i.test(ua)) os = 'Android Device';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS Device';
  else if (/Linux/i.test(ua)) os = 'Linux Workstation';

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  return `${os} (${browser})`;
}

let cachedIdentity: DeviceIdentity | null = null;

/**
 * Generates or retrieves the hardware-bound cryptographic identity for this specific device.
 */
export async function getDeviceIdentity(): Promise<DeviceIdentity> {
  if (cachedIdentity) return cachedIdentity;

  let deviceId = localStorage.getItem(DEVICE_ID_KEY) || (await readFromIndexedDB(DEVICE_ID_KEY));
  if (!deviceId) {
    deviceId = `DEV_${generateRandomHex(8).toUpperCase()}`;
  }
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  await writeToIndexedDB(DEVICE_ID_KEY, deviceId);

  let deviceSecret =
    localStorage.getItem(DEVICE_SECRET_KEY) || (await readFromIndexedDB(DEVICE_SECRET_KEY));
  if (!deviceSecret) {
    deviceSecret = generateRandomHex(32);
  }
  localStorage.setItem(DEVICE_SECRET_KEY, deviceSecret);
  await writeToIndexedDB(DEVICE_SECRET_KEY, deviceSecret);

  const rawHardwareTraits = [
    navigator.userAgent || '',
    navigator.platform || '',
    String(navigator.hardwareConcurrency || 1),
    String((navigator as any).deviceMemory || 'std'),
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.language || '',
    getWebGLSignature(),
  ].join('||');

  const hardwareSignature = await sha256Hex(rawHardwareTraits);
  const deviceSecretHash = await sha256Hex(`${deviceSecret}::${deviceId}`);
  const compositeDeviceHash = await sha256Hex(
    `${deviceId}|${hardwareSignature}|${deviceSecretHash}`
  );

  cachedIdentity = {
    deviceId,
    hardwareSignature,
    deviceSecretHash,
    compositeDeviceHash,
    deviceLabel: getReadableDeviceLabel(),
  };

  return cachedIdentity;
}

/**
 * Verifies whether the current physical device has paid Standard JAMB access.
 * Checks both server webhook store and Firestore deviceAccess collection,
 * strictly enforcing that hardwareSignature, deviceSecretHash, and compositeDeviceHash match.
 */
export async function checkDeviceAccess(): Promise<DeviceAccessStatus> {
  const identity = await getDeviceIdentity();

  // 1. Check backend server webhook/entitlement store
  try {
    const res = await fetch('/api/paystack/access-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(identity),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.unlocked && data.accessRecord) {
        // Ensure Firestore is also synced with this verified device entitlement
        try {
          await setDoc(
            doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId),
            {
              ...data.accessRecord,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Ignore offline Firestore sync error
        }

        return {
          unlocked: true,
          reference: data.accessRecord.reference,
          email: data.accessRecord.email,
          unlockedAt: data.accessRecord.unlockedAt,
          deviceId: identity.deviceId,
          deviceLabel: identity.deviceLabel,
        };
      }
    }
  } catch {
    // Fall through to Firestore check
  }

  // 2. Check Firestore deviceAccess collection for this exact device
  try {
    const snap = await getDoc(doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId));
    if (snap.exists()) {
      const data = snap.data();
      const isAuthenticDevice =
        data.status === 'active' &&
        data.deviceId === identity.deviceId &&
        data.hardwareSignature === identity.hardwareSignature &&
        data.deviceSecretHash === identity.deviceSecretHash &&
        data.compositeDeviceHash === identity.compositeDeviceHash;

      if (isAuthenticDevice) {
        return {
          unlocked: true,
          reference: data.reference,
          email: data.email,
          unlockedAt: data.unlockedAt,
          deviceId: identity.deviceId,
          deviceLabel: identity.deviceLabel,
        };
      } else {
        return {
          unlocked: false,
          deviceId: identity.deviceId,
          deviceLabel: identity.deviceLabel,
          reason:
            'Hardware/device secret mismatch. Access is strictly bound to the original device that completed payment.',
        };
      }
    }
  } catch {
    // Ignore if offline
  }

  return {
    unlocked: false,
    deviceId: identity.deviceId,
    deviceLabel: identity.deviceLabel,
  };
}

/**
 * Subscribe to real-time Firestore webhook updates for this device's access status
 */
export function subscribeToDeviceAccess(
  identity: DeviceIdentity,
  onUnlocked: (status: DeviceAccessStatus) => void
): () => void {
  const docRef = doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (
        data.status === 'active' &&
        data.deviceId === identity.deviceId &&
        data.hardwareSignature === identity.hardwareSignature &&
        data.deviceSecretHash === identity.deviceSecretHash &&
        data.compositeDeviceHash === identity.compositeDeviceHash
      ) {
        onUnlocked({
          unlocked: true,
          reference: data.reference,
          email: data.email,
          unlockedAt: data.unlockedAt,
          deviceId: identity.deviceId,
          deviceLabel: identity.deviceLabel,
        });
      }
    },
    () => {}
  );
}

/**
 * Initialize a Paystack payment strictly pre-bound to this device
 */
export async function initializeDevicePayment(email: string, username: string) {
  const identity = await getDeviceIdentity();
  const res = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      username,
      ...identity,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not initialize Paystack payment.');
  }

  // Also pre-register the payment reference lock in Firestore so no other device can ever claim it
  try {
    await setDoc(doc(db, PAYMENT_WEBHOOKS_COLLECTION, data.reference), {
      reference: data.reference,
      deviceId: identity.deviceId,
      hardwareSignature: identity.hardwareSignature,
      deviceSecretHash: identity.deviceSecretHash,
      compositeDeviceHash: identity.compositeDeviceHash,
      deviceLabel: identity.deviceLabel,
      email: email.trim(),
      username: username.trim() || 'Candidate',
      amountKobo: data.amountKobo,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Continue even if Firestore write fails
  }

  return {
    ...data,
    identity,
  };
}

/**
 * Verify a completed Paystack payment reference or webhook for this specific device.
 * Strictly blocks any attempt to reuse a reference on a second device.
 */
export async function verifyDevicePaymentReference(
  reference: string,
  email: string,
  username: string
): Promise<DeviceAccessStatus> {
  const identity = await getDeviceIdentity();
  const cleanRef = reference.trim();

  // 1. Check Firestore paymentWebhooks lock first to prevent cross-device reuse
  try {
    const refSnap = await getDoc(doc(db, PAYMENT_WEBHOOKS_COLLECTION, cleanRef));
    if (refSnap.exists()) {
      const refData = refSnap.data();
      if (
        refData.deviceId !== identity.deviceId ||
        refData.hardwareSignature !== identity.hardwareSignature ||
        refData.deviceSecretHash !== identity.deviceSecretHash ||
        refData.compositeDeviceHash !== identity.compositeDeviceHash
      ) {
        throw new Error(
          'Access Denied: This payment reference is already locked to another device. A single payment cannot be used across multiple devices.'
        );
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('Access Denied')) {
      throw err;
    }
  }

  // 2. Verify with backend Paystack verification / webhook endpoint
  const res = await fetch('/api/paystack/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reference: cleanRef,
      email,
      username,
      ...identity,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.unlocked) {
    throw new Error(data.error || 'Payment verification failed.');
  }

  // 3. Persist the verified single-device lock in Firestore
  const nowIso = new Date().toISOString();
  try {
    await setDoc(
      doc(db, PAYMENT_WEBHOOKS_COLLECTION, cleanRef),
      {
        reference: cleanRef,
        deviceId: identity.deviceId,
        hardwareSignature: identity.hardwareSignature,
        deviceSecretHash: identity.deviceSecretHash,
        compositeDeviceHash: identity.compositeDeviceHash,
        deviceLabel: identity.deviceLabel,
        email: data.accessRecord?.email || email,
        username: data.accessRecord?.username || username,
        amountKobo: data.accessRecord?.amountKobo || 100000,
        status: 'success',
        paidAt: nowIso,
        webhookReceivedAt: nowIso,
      },
      { merge: true }
    );

    await setDoc(doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId), {
      deviceId: identity.deviceId,
      hardwareSignature: identity.hardwareSignature,
      deviceSecretHash: identity.deviceSecretHash,
      compositeDeviceHash: identity.compositeDeviceHash,
      deviceLabel: identity.deviceLabel,
      reference: cleanRef,
      email: data.accessRecord?.email || email,
      username: data.accessRecord?.username || username,
      amountKobo: data.accessRecord?.amountKobo || 100000,
      currency: 'NGN',
      status: 'active',
      unlockedAt: nowIso,
    });
  } catch {
    // Non-fatal if Firestore is temporarily unreachable
  }

  return {
    unlocked: true,
    reference: cleanRef,
    email: data.accessRecord?.email || email,
    unlockedAt: nowIso,
    deviceId: identity.deviceId,
    deviceLabel: identity.deviceLabel,
  };
}

/**
 * Trigger webhook confirmation for a transaction reference bound to this device
 */
export async function confirmWebhookForDevice(
  reference: string,
  email: string,
  username: string
): Promise<DeviceAccessStatus> {
  const identity = await getDeviceIdentity();
  const cleanRef = reference.trim();

  // Check Firestore lock to ensure no other device owns this reference
  try {
    const refSnap = await getDoc(doc(db, PAYMENT_WEBHOOKS_COLLECTION, cleanRef));
    if (refSnap.exists()) {
      const refData = refSnap.data();
      if (
        refData.deviceId !== identity.deviceId ||
        refData.compositeDeviceHash !== identity.compositeDeviceHash
      ) {
        throw new Error(
          'Access Denied: This payment reference is strictly bound to another device and cannot be used on multiple devices.'
        );
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('Access Denied')) {
      throw err;
    }
  }

  const res = await fetch('/api/paystack/webhook-dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reference: cleanRef,
      email,
      username,
      ...identity,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.unlocked) {
    throw new Error(data.error || 'Webhook confirmation failed.');
  }

  const nowIso = new Date().toISOString();
  try {
    await setDoc(
      doc(db, PAYMENT_WEBHOOKS_COLLECTION, cleanRef),
      {
        reference: cleanRef,
        deviceId: identity.deviceId,
        hardwareSignature: identity.hardwareSignature,
        deviceSecretHash: identity.deviceSecretHash,
        compositeDeviceHash: identity.compositeDeviceHash,
        deviceLabel: identity.deviceLabel,
        email,
        username,
        amountKobo: data.accessRecord?.amountKobo || 100000,
        status: 'success',
        paidAt: nowIso,
        webhookReceivedAt: nowIso,
      },
      { merge: true }
    );

    await setDoc(doc(db, DEVICE_ACCESS_COLLECTION, identity.deviceId), {
      deviceId: identity.deviceId,
      hardwareSignature: identity.hardwareSignature,
      deviceSecretHash: identity.deviceSecretHash,
      compositeDeviceHash: identity.compositeDeviceHash,
      deviceLabel: identity.deviceLabel,
      reference: cleanRef,
      email,
      username,
      amountKobo: data.accessRecord?.amountKobo || 100000,
      currency: 'NGN',
      status: 'active',
      unlockedAt: nowIso,
    });
  } catch {
    // Continue if offline
  }

  return {
    unlocked: true,
    reference: cleanRef,
    email,
    unlockedAt: nowIso,
    deviceId: identity.deviceId,
    deviceLabel: identity.deviceLabel,
  };
}
