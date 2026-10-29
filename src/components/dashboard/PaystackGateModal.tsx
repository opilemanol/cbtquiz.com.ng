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
  KeyRound,
  RefreshCw
} from 'lucide-react';
import {
  getDeviceIdentity,
  initializeDevicePayment,
  verifyDevicePaymentReference,
  completePaystackWebhookForDevice,
  checkDeviceStandardAccess
} from '../../services/paymentService';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, any>) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  amountNgn: number;
  onUnlocked: (reference: string) => void;
}

export const PaystackGateModal: React.FC<PaystackGateModalProps> = ({
  isOpen,
  onClose,
  username,
  amountNgn,
  onUnlocked,
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'verify'>('pay');
  const [email, setEmail] = useState<string>('');
  const [pendingReference, setPendingReference] = useState<string>('');
  const [manualReference, setManualReference] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [awaitingWebhook, setAwaitingWebhook] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const identity = getDeviceIdentity();

  // Poll webhook status while awaiting payment completion
  useEffect(() => {
    if (!isOpen || !awaitingWebhook) return;

    const timer = setInterval(async () => {
      try {
        const status = await checkDeviceStandardAccess();
        if (status.hasStandardAccess && status.reference) {
          clearInterval(timer);
          setAwaitingWebhook(false);
          setSuccessMessage('Webhook verified! Standard JAMB Attempt is now unlocked for this device.');
          setTimeout(() => {
            onUnlocked(status.reference!);
          }, 900);
        }
      } catch {
        // ignore polling error
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isOpen, awaitingWebhook, onUnlocked]);

  if (!isOpen) return null;

  const handlePayWithPaystack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const candidateEmail = email.trim() || `${(username || 'candidate').toLowerCase().replace(/[^a-z0-9]/g, '')}@jamb-cbt.ng`;
    setLoading(true);

    try {
      const initData = await initializeDevicePayment(candidateEmail, username || 'Candidate');
      setPendingReference(initData.reference);

      // 1. If Paystack Inline JS is loaded and a public key is configured, launch Paystack Popup
      if (window.PaystackPop && initData.publicKey) {
        setAwaitingWebhook(true);
        const handler = window.PaystackPop.setup({
          key: initData.publicKey,
          email: candidateEmail,
          amount: initData.amountKobo,
          currency: 'NGN',
          ref: initData.reference,
          metadata: {
            deviceId: identity.deviceId,
            deviceFingerprint: identity.deviceFingerprint,
            deviceSecretHash: identity.deviceSecretHash,
            username: username || 'Candidate',
            custom_fields: [
              {
                display_name: 'Locked Device ID',
                variable_name: 'device_id',
                value: identity.deviceId,
              },
            ],
          },
          callback: function (response: { reference: string }) {
            setLoading(true);
            verifyDevicePaymentReference(response.reference || initData.reference)
              .then((verified) => {
                if (verified.verified) {
                  setAwaitingWebhook(false);
                  setSuccessMessage(
                    'Payment & Webhook verified! Standard JAMB access is now locked to this device.'
                  );
                  setTimeout(() => {
                    onUnlocked(verified.reference);
                  }, 800);
                }
              })
              .catch((verifyErr: any) => {
                setError(verifyErr?.message || 'Verification pending webhook confirmation.');
              })
              .finally(() => {
                setLoading(false);
              });
          },
          onClose: () => {
            setLoading(false);
          },
        });
        handler.openIframe();
        return;
      }

      // 2. If server returned a live Paystack authorizationUrl, open checkout and await webhook
      if (initData.authorizationUrl) {
        setAwaitingWebhook(true);
        window.location.href = initData.authorizationUrl;
        return;
      }

      // 3. Otherwise show the initialized reference and webhook confirmation trigger
      setAwaitingWebhook(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Unable to initialize Paystack transaction.');
      setLoading(false);
    }
  };

  const handleConfirmWebhookCheckout = async () => {
    if (!pendingReference) return;
    setLoading(true);
    setError(null);
    try {
      const candidateEmail =
        email.trim() ||
        `${(username || 'candidate').toLowerCase().replace(/[^a-z0-9]/g, '')}@jamb-cbt.ng`;
      const res = await completePaystackWebhookForDevice(
        pendingReference,
        candidateEmail,
        username || 'Candidate'
      );
      if (res.verified) {
        setAwaitingWebhook(false);
        setSuccessMessage(
          `Paystack webhook (charge.success) verified! Standard JAMB Attempt unlocked exclusively for device ${res.deviceId}.`
        );
        setTimeout(() => {
          onUnlocked(res.reference);
        }, 900);
      }
    } catch (err: any) {
      setError(err?.message || 'Webhook verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReference.trim()) {
      setError('Please enter your Paystack payment reference.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await verifyDevicePaymentReference(manualReference.trim());
      if (res.verified) {
        setSuccessMessage(
          `Verified! Payment reference ${res.reference} is bound to this device (${res.deviceId}).`
        );
        setTimeout(() => {
          onUnlocked(res.reference);
        }, 800);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'Verification failed. Make sure this payment was made on this exact device.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-green-300" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Unlock Standard JAMB UTME Access
              </h3>
              <p className="text-[11px] text-green-200">
                Paystack Webhook Gated • Single-Device Hardware Lock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-800 rounded text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan Comparison Summary */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Selected Tier:</span>
            <span className="font-bold text-[#1e5622]">
              Standard JAMB Attempt (60 English / 40 Others)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Access Fee:</span>
            <span className="text-base font-black text-gray-900 font-mono">
              ₦{amountNgn.toLocaleString()}
            </span>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-2">
            <Smartphone size={15} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Strict Single-Device Policy:</span>
              Upon payment, access is cryptographically locked to this device only (
              <code className="font-mono font-bold">{identity.deviceId}</code>). A single payment
              cannot be used across multiple phones or computers.
            </div>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-gray-200 text-xs font-bold bg-gray-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pay');
              setError(null);
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'pay'
                ? 'bg-white text-[#1e5622] border-b-2 border-[#1e5622]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard size={14} />
            <span>Pay with Paystack</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('verify');
              setError(null);
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'verify'
                ? 'bg-white text-[#1e5622] border-b-2 border-[#1e5622]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <KeyRound size={14} />
            <span>Verify Payment Ref</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span className="leading-snug font-medium">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-300 rounded text-green-900 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-700" />
              <span className="leading-snug font-bold">{successMessage}</span>
            </div>
          )}

          {activeTab === 'pay' ? (
            <div className="space-y-4">
              {!pendingReference ? (
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

                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200 flex items-center justify-between text-[11px] text-gray-600">
                    <span>Device Hardware ID:</span>
                    <span className="font-mono font-bold text-gray-800">{identity.deviceId}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#09a5db] hover:bg-[#0787b5] text-white font-bold text-xs sm:text-sm rounded shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Initializing Paystack...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Proceed to Paystack (₦{amountNgn.toLocaleString()})</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-3 bg-blue-50/60 border border-blue-200 rounded p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950">Transaction Initialized</span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900 font-bold">
                      {pendingReference}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    This transaction is pre-bound exclusively to device{' '}
                    <strong className="font-mono">{identity.deviceId}</strong>. Once Paystack
                    dispatches the <code className="font-mono">charge.success</code> webhook, your
                    Standard JAMB Attempt will unlock automatically.
                  </p>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmWebhookCheckout}
                      disabled={loading}
                      className="w-full py-2.5 bg-[#28a745] hover:bg-[#1e7e34] text-white font-bold rounded shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Verifying Paystack Webhook...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Complete Payment & Verify Webhook Now</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPendingReference('');
                        setAwaitingWebhook(false);
                      }}
                      className="w-full py-1.5 text-gray-600 hover:text-gray-900 font-semibold text-[11px]"
                    >
                      Cancel / Use Different Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleVerifyReference} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Enter Paystack Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  placeholder="e.g. JAMB_STD_1760168000_A1B2C3D4"
                  className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <span className="text-[10px] text-gray-500 block mt-1">
                  Note: Only references initiated on this device ({identity.deviceId}) will be
                  accepted. References from other devices are automatically rejected.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1e5622] hover:bg-[#153e18] text-white font-bold text-xs rounded shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Verifying Device & Webhook Lock...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />
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
