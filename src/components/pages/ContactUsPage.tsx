import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Academic Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
          Candidate & Institutional Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight mt-3">
          Contact Teramayo Academic Support
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Have questions regarding our CBT question bank, syllabus coverage, Paystack subscription, or academic partnerships? Our support desk responds within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Contact Info Cards */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 border border-emerald-200">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950">
              Official Email
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">
              For general inquiries, editorial feedback, and Paystack support:
            </p>
            <a
              href="mailto:teramayoict@gmail.com"
              className="text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:underline break-all"
            >
              teramayoict@gmail.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 border border-emerald-200">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950">
              Location & Operations
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Teramayo ICT Educational Services
              <br />
              Ibadan, Oyo state, Nigeria
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 border border-emerald-200">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950">
              Operating Hours
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Monday - Saturday: 8:00 AM - 6:00 PM (WAT)
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-xs md:col-span-2">
          <h2 className="text-xl font-bold text-emerald-950 mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Fill out the form below and an academic counselor or technical support specialist will get back to you.
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-900">
                Message Received!
              </h3>
              <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                Thank you for contacting Teramayo Educational Services. We have received your inquiry and our team will reply to <strong>{email}</strong> shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Teramayo Olufemi"
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Subject Category
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="General Academic Inquiry">General Academic Inquiry</option>
                  <option value="Paystack Payment Support">Paystack Payment & Single-Device Access</option>
                  <option value="Question Bank Feedback">Question Bank Error or Correction</option>
                  <option value="Curriculum Syllabus Feedback">Curriculum Syllabus Feedback</option>
                  <option value="School / Institutional Partnership">School / Institutional Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or question in detail..."
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message to Teramayo Team</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
