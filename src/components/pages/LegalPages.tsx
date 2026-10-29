import React from 'react';
import { Shield, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

interface LegalPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 bg-white">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-600" />
        <span>Back to Portal</span>
      </button>

      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-xs prose max-w-none text-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 m-0">
            Privacy Policy & AdSense Disclosures
          </h1>
        </div>

        <p className="text-xs text-slate-500">
          Last Updated: October 2026 · Effective Date: January 2026
        </p>

        <p className="text-sm leading-relaxed mt-4">
          At <strong>CBT Quiz</strong> (operated by <strong>Teramayo ICT Educational Services</strong>), accessible from our web application, the privacy of our visitors and students is of paramount importance to us. This Privacy Policy document outlines the types of information that is collected and recorded by CBT Quiz and how we use it, in strict compliance with the Nigerian Data Protection Regulation (NDPR) and international privacy standards.
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          1. Google AdSense & DoubleClick DART Cookies
        </h3>
        <p className="text-sm leading-relaxed">
          Google is a third-party vendor on our site. It uses cookies, specifically the <strong>DoubleClick DART cookie</strong>, to serve ads to our site visitors based upon their visit to this website and other sites on the internet.
        </p>
        <ul className="text-sm space-y-1.5 my-3 text-slate-700">
          <li>
            Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.
          </li>
          <li>
            Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.
          </li>
          <li>
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold underline"
            >
              Google Ads Settings
            </a>{' '}
            or through{' '}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold underline"
            >
              aboutads.info
            </a>
            .
          </li>
        </ul>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          2. Log Files & Browser Local Storage
        </h3>
        <p className="text-sm leading-relaxed">
          CBT Quiz follows standard procedures of using log files and browser <code>localStorage</code>. The information stored locally includes candidate practice test attempts, score history, selected subjects, and cryptographic device identifiers used strictly to enforce the single-device license for Standard Mode subscriptions.
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          3. Paystack Payment Processing
        </h3>
        <p className="text-sm leading-relaxed">
          When candidates upgrade to the Standard Attempt Tier via Paystack, sensitive payment information (such as debit card numbers and bank verification details) is handled exclusively by <strong>Paystack Payments Limited</strong> via their PCI-DSS Level 1 certified gateway. CBT Quiz never collects or stores your credit or debit card numbers on our servers. We receive only transaction references and cryptographic verification tokens to unlock candidate access on the paying device.
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          4. Contact Information
        </h3>
        <p className="text-sm leading-relaxed">
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact our Data Protection Officer at:
          <br />
          <strong>Email:</strong>{' '}
          <a
            href="mailto:teramayoict@gmail.com"
            className="text-emerald-700 font-bold underline"
          >
            teramayoict@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export const TermsOfServicePage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 bg-white">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-600" />
        <span>Back to Portal</span>
      </button>

      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-xs prose max-w-none text-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 m-0">
            Terms of Service
          </h1>
        </div>

        <p className="text-xs text-slate-500">
          Effective Date: January 2026
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          1. Acceptance of Terms
        </h3>
        <p className="text-sm leading-relaxed">
          By accessing and utilizing CBT Quiz (the "Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue using this web application.
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          2. Educational Simulation Disclaimer
        </h3>
        <p className="text-sm leading-relaxed">
          CBT Quiz is an independent educational simulation platform designed solely to help students prepare for computer-based entrance examinations. The mock questions, simulated timers, scoring calculations, and solutions are prepared for study purposes only.
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          3. Single-Device Subscription Access
        </h3>
        <p className="text-sm leading-relaxed">
          Standard Mode access purchased via Paystack grants a non-transferable, single-device license tied to the cryptographic hardware fingerprint of the paying device. Attempting to clone or distribute access tokens across multiple devices is strictly prohibited and leads to immediate revocation without refund.
        </p>

        <h3 className="text-lg font-bold text-emerald-950 mt-6">
          4. Contact Us
        </h3>
        <p className="text-sm leading-relaxed">
          Inquiries regarding terms of service should be directed to{' '}
          <strong className="text-emerald-800">teramayoict@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 bg-white">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-600" />
        <span>Back to Portal</span>
      </button>

      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-xs prose max-w-none text-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 m-0">
            Official Trademark & Examination Disclaimer
          </h1>
        </div>

        <p className="text-sm leading-relaxed mt-4">
          <strong>JAMB</strong> and <strong>UTME</strong> are registered trademarks of the Joint Admissions and Matriculation Board of Nigeria.
        </p>

        <p className="text-sm leading-relaxed">
          <strong>CBT Quiz</strong> is an independent educational technology platform developed and maintained by <strong>Teramayo ICT Educational Services</strong>. We are NOT affiliated with, sponsored by, authorized by, or endorsed by the Joint Admissions and Matriculation Board (JAMB), the Federal Ministry of Education, or any other governmental examining agency.
        </p>

        <p className="text-sm leading-relaxed">
          All past question patterns, syllabus outlines, and solutions are compiled by our independent team of educators for instructional and preparatory purposes under fair use.
        </p>

        <p className="text-sm leading-relaxed">
          For any trademark clarification or legal notice, please email{' '}
          <a
            href="mailto:teramayoict@gmail.com"
            className="text-emerald-700 font-bold underline"
          >
            teramayoict@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};
