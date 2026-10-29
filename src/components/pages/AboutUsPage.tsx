import React from 'react';
import { Award, Users, BookOpen, CheckCircle } from 'lucide-react';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
          About Teramayo Educational Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight mt-3">
          Empowering Nigerian Candidates Toward UTME Academic Excellence
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          CBT Quiz was founded by Teramayo ICT Educational Services to bridge the digital divide for thousands of secondary school leavers and UTME candidates across Nigeria.
        </p>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-emerald-950 mb-2">
            Realistic Exam Simulation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our CBT interface replicates the actual computer-based test environment used by Nigerian examining bodies, including on-screen timers, 8-key shortcuts, and subject navigation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-emerald-950 mb-2">
            Syllabus-Aligned Content
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every study note, formula guide, and question format strictly reflects the official curriculum published by educational authorities, ensuring maximum relevance.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-emerald-950 mb-2">
            Affordable Dual Model
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We offer completely free open-access syllabus notes and revision materials supported by Google AdSense, paired with affordable single-device Standard Mock practice via Paystack.
          </p>
        </div>
      </div>

      {/* Editorial & Academic Board */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 mb-10 shadow-xs">
        <h2 className="text-xl font-bold text-emerald-950 mb-4">
          Academic Review & Editorial Standards
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
          Our questions and comprehensive revision guides are audited by experienced Nigerian secondary school educators across Mathematics, Physical Sciences, Biological Sciences, Arts, and Commercial disciplines. We enforce strict accuracy checks on all formulas, calculations, and literary interpretations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Regular syllabus updates aligned with each examination cycle</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verified answers with step-by-step mathematical explanations</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official contact channel at teramayoict@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Active candidate bug and error correction reporting system</span>
          </div>
        </div>
      </div>
    </div>
  );
};
