import React from 'react';
import { X, Fingerprint, ShieldCheck } from 'lucide-react';

interface BiometricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
}

export const BiometricsModal: React.FC<BiometricsModalProps> = ({
  isOpen,
  onClose,
  candidateName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden text-center">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-4 py-2.5 flex items-center justify-between font-semibold text-xs tracking-wide">
          <span>JAMB CBT BIOMETRIC VERIFICATION</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center text-green-700 animate-pulse">
              <Fingerprint size={48} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 shadow">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900">Biometric Verification Simulated</h4>
            <p className="text-xs font-semibold text-green-700 mt-0.5">STATUS: VALIDATED & ACCREDITED</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600 text-left space-y-1">
            <p><span className="font-semibold text-gray-800">Candidate:</span> {candidateName || 'PROSPER'}</p>
            <p><span className="font-semibold text-gray-800">Verification Mode:</span> Thumbprint Matching</p>
            <p><span className="font-semibold text-gray-800">Session ID:</span> UTME-{Math.floor(100000 + Math.random() * 900000)}</p>
            <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200 italic">
              Biometric verification is simulated in Practice Mode.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-[#1e5622] hover:bg-[#163f19] text-white rounded text-xs font-bold transition-colors"
          >
            Continue Examination
          </button>
        </div>
      </div>
    </div>
  );
};
