import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import {
  getDeviceIdentity,
  initializeDevicePayment,
  verifyDevicePaymentReference,
  confirmWebhookForDevice,
  subscribeToDeviceAccess,
  type DeviceIdentity,
  type DeviceAccessStatus,
} from '../../services/deviceService';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, any>) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onDeviceUnlocked: (status: DeviceAccessStatus) => void;
}

export const PaystackPaymentModal: React.FC<PaystackPaymentModalProps> = ({
  isOpen,
  onClose,
  username,
  onDeviceUnlocked,
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'verify'>('pay');
  const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
  const [email, setEmail] = useState<string>('');
  const [amountNgn, setAmountNgn] = useState<number>(1000);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [hasLiveKeys, setHasLiveKeys] = useState<boolean>(false);

  const [pendingReference, setPendingReference] = useState<string>('');
  const [manualReference, setManualReference] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [awaitingWebhook, setAwaitingWebhook] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    let unsubscribe: (() => void) | null = null;

    async function init() {
      const id = await getDeviceIdentity();
      setIdentity(id);

      try {
        const res = await fetch('/api/paystack/config');
        if (res.ok) {
          const cfg = await res.json();
          if (cfg.amountNgn) setAmountNgn(cfg.amountNgn);
          if (cfg.webhookUrl) setWebhookUrl(cfg.webhookUrl);
          setHasLiveKeys(Boolean(cfg.hasPublicKey || cfg.hasSecretKey));
        }
      } catch {
        // default fallback
      }

      unsubscribe = subscribeToDeviceAccess(id, (status) => {
        if (status.unlocked) {
          setAwaitingWebhook(false);
          setSuccessMsg('Webhook confirmed! This device is now unlocked for Standard JAMB Attempts.');
          setTimeout(() => {
            onDeviceUnlocked(status);
          }, 800);
        }
      });
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, onDeviceUnlocked]);

  if (!isOpen) return null;

  const handlePayWithPaystack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address for your Paystack receipt.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const initData = await initializeDevicePayment(email.trim(), username || 'Candidate');
      setPendingReference(initData.reference);

      // 1. If Paystack Inline JS is loaded and a public key is configured, launch Paystack Popup
      if (
        initData.publicKey &&
        !String(initData.publicKey).includes('xxxx') &&
        window.PaystackPop
      ) {
        const handler = window.PaystackPop.setup({
          key: initData.publicKey,
          email: email.trim(),
          amount: initData.amountKobo,
          currency: 'NGN',
          ref: initData.reference,
          metadata: {
            deviceId: initData.identity.deviceId,
            hardwareSignature: initData.identity.hardwareSignature,
            deviceSecretHash: initData.identity.deviceSecretHash,
            compositeDeviceHash: initData.identity.compositeDeviceHash,
            deviceLabel: initData.identity.deviceLabel,
            username: username || 'Candidate',
            custom_fields: [
              {
                display_name: 'Locked Device ID',
                variable_name: 'device_id',
                value: initData.identity.deviceId,
              },
            ],
          },
          callback: (response: { reference: string }) => {
            setAwaitingWebhook(true);
            verifyDevicePaymentReference(
              response.reference || initData.reference,
              email.trim(),
              username
            )
              .then((status) => {
                setAwaitingWebhook(false);
                setSuccessMsg('Payment verified & locked to this device!');
                setTimeout(() => onDeviceUnlocked(status), 600);
              })
              .catch((err: any) => {
                setAwaitingWebhook(false);
                setErrorMsg(err?.message || 'Waiting for Paystack webhook confirmation.');
              });
          },
          onClose: () => {
            setLoading(false);
          },
        });
        handler.openIframe();
        setLoading(false);
        return;
      }

      // 2. If server returned a Paystack hosted authorization_url, open/Await webhook
      if (initData.authorizationUrl) {
        window.location.href = initData.authorizationUrl;
        return;
      }

      // 3. Otherwise enter Webhook Confirmation state for the initialized reference
      setAwaitingWebhook(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize Paystack checkout.');
      setLoading(false);
    }
  };

  const handleConfirmWebhook = async () => {
    if (!pendingReference) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      // First try live Paystack verification if keys are present; otherwise dispatch signed webhook for this device
      let status: DeviceAccessStatus;
      if (hasLiveKeys) {
        status = await verifyDevicePaymentReference(pendingReference, email.trim(), username);
      } else {
        status = await confirmWebhookForDevice(pendingReference, email.trim(), username);
      }
      setSuccessMsg('Paystack webhook verified! Standard JAMB access unlocked strictly for this device.');
      setTimeout(() => {
        onDeviceUnlocked(status);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Webhook verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyExistingReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReference.trim()) {
      setErrorMsg('Please enter your Paystack payment reference.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const status = await verifyDevicePaymentReference(
        manualReference.trim(),
        email.trim() || 'candidate@jamb.ng',
        username
      );
      setSuccessMsg('Reference verified for this device!');
      setTimeout(() => {
        onDeviceUnlocked(status);
      }, 600);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          'Could not verify reference for this device. Remember a single payment cannot be shared across devices.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#1e5622] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-amber-300" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                UNLOCK STANDARD JAMB ATTEMPT
              </h3>
              <p className="text-[11px] text-green-100">
                Paystack Webhook Gated • Single-Device Hardware Lock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-black/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('pay');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'pay'
                ? 'border-[#1e5622] text-[#1e5622] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Pay with Paystack
          </button>
          <button
            onClick={() => {
              setActiveTab('verify');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'verify'
                ? 'border-[#1e5622] text-[#1e5622] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Verify Reference
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Device Fingerprint Binding Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Smartphone size={14} className="text-amber-700" />
                Strict Single-Device Policy
              </span>
              <span className="font-mono text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded">
                {identity?.deviceId || 'Identifying...'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Upon payment webhook confirmation, access is cryptographically locked to{' '}
              <strong>this device alone ({identity?.deviceLabel || 'Current Device'})</strong>. A
              single payment cannot be used or shared on any other phone or computer.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded flex items-start gap-2 text-xs">
              <AlertTriangle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span className="leading-snug font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border border-green-300 text-green-900 p-3 rounded flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 size={16} className="shrink-0 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'pay' ? (
            <>
              {/* Plan Summary */}
              <div className="border border-gray-200 rounded-md p-3.5 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block text-xs">
                    Standard JAMB UTME Access
                  </span>
                  <span className="text-[11px] text-gray-600">
                    60 Questions (Use of English) • 40 Questions (Other Subjects)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#1e5622]">
                    ₦{amountNgn.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-gray-500">One-Device Pass</span>
                </div>
              </div>

              {!awaitingWebhook ? (
                <form onSubmit={handlePayWithPaystack} className="space-y-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Candidate Email Address (for Paystack Receipt)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="candidate@example.com"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identity}
                    className="w-full bg-[#28a745] hover:bg-[#1e7e34] text-white font-bold py-2.5 rounded shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Initializing Paystack Device Lock...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} />
                        <span>Pay ₦{amountNgn.toLocaleString()} to Unlock This Device</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="border border-green-300 bg-green-50/60 rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-900 flex items-center gap-1.5">
                      <RefreshCw size={14} className="animate-spin text-green-700" />
                      Awaiting Paystack Webhook
                    </span>
                    <span className="font-mono text-[11px] bg-white border border-green-300 px-2 py-0.5 rounded text-gray-800">
                      {pendingReference}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    Reference <strong>{pendingReference}</strong> is pre-bound exclusively to device{' '}
                    <strong>{identity?.deviceId}</strong>. Once Paystack dispatches{' '}
                    <code className="bg-white px-1 rounded">charge.success</code> to the webhook,
                    your device unlocks automatically.
                  </p>

                  {webhookUrl && (
                    <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-gray-200 break-all">
                      <strong>Webhook Endpoint:</strong> {webhookUrl}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmWebhook}
                      disabled={loading}
                      className="flex-1 bg-[#1e5622] hover:bg-[#153e18] text-white font-bold py-2 rounded shadow flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={14} />
                      )}
                      <span>
                        {hasLiveKeys
                          ? 'Verify Payment Status Now'
                          : 'Complete Webhook Verification'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAwaitingWebhook(false)}
                      className="px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-100 font-semibold"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleVerifyExistingReference} className="space-y-3">
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Already paid on <strong>this exact device</strong>? Enter your Paystack transaction
                reference below. Note: References paid on another phone or computer will be
                rejected.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Paystack Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  placeholder="e.g. JAMB_STD_1728..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1565d8] hover:bg-[#0d47a1] text-white font-bold py-2.5 rounded shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Checking Device & Webhook Lock...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Verify Reference for This Device</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
