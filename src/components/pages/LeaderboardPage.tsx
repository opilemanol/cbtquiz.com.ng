import React from 'react';
import { Trophy, Medal, Award, Flame, ArrowRight } from 'lucide-react';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

interface LeaderboardPageProps {
  onStartQuiz: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onStartQuiz }) => {
  const topStudents = [
    { rank: 1, name: 'Chukwuebuka O.', score: 348, subjects: 'ENG, MTH, PHY, CHM', streak: '18 Days', badge: 'Diamond Scholar' },
    { rank: 2, name: 'Amina Danjuma', score: 342, subjects: 'ENG, ECO, GOV, LIT', streak: '15 Days', badge: 'Diamond Scholar' },
    { rank: 3, name: 'Femi Adeleke', score: 338, subjects: 'ENG, ACC, COM, ECO', streak: '14 Days', badge: 'Gold Scholar' },
    { rank: 4, name: 'Blessing Udoh', score: 334, subjects: 'ENG, BIO, CHM, PHY', streak: '12 Days', badge: 'Gold Scholar' },
    { rank: 5, name: 'Teramayo Olufemi', score: 328, subjects: 'ENG, MTH, PHY, CHM', streak: '11 Days', badge: 'Silver Scholar' },
    { rank: 6, name: 'Khadija Bello', score: 325, subjects: 'ENG, LIT, GOV, CRK', streak: '9 Days', badge: 'Silver Scholar' },
    { rank: 7, name: 'Emmanuel Eze', score: 320, subjects: 'ENG, BIO, CHM, AGR', streak: '8 Days', badge: 'Bronze Scholar' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
          National Candidate Honor Roll
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight mt-3">
          UTME Mock Examination Leaderboard
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Celebrating top academic performers, consistent daily study streaks, and high-accuracy scores across all standard simulated mock trials.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
        {/* Rank 2 */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 text-center shadow-xs order-2 md:order-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-lg mb-2">
            2
          </div>
          <h3 className="font-bold text-emerald-950 text-base">
            {topStudents[1].name}
          </h3>
          <div className="text-2xl font-extrabold text-emerald-900 my-1">
            {topStudents[1].score} / 400
          </div>
          <div className="text-xs text-slate-500">{topStudents[1].subjects}</div>
          <div className="mt-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1 px-3 rounded-lg inline-block">
            {topStudents[1].streak} Study Streak
          </div>
        </div>

        {/* Rank 1 */}
        <div className="bg-white p-8 rounded-3xl border-2 border-emerald-500 text-center shadow-md order-1 md:order-2 scale-105">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md mb-2">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            National Rank #1
          </div>
          <h3 className="font-extrabold text-emerald-950 text-xl mt-1">
            {topStudents[0].name}
          </h3>
          <div className="text-3xl font-black text-emerald-700 my-1">
            {topStudents[0].score} / 400
          </div>
          <div className="text-xs text-slate-500">{topStudents[0].subjects}</div>
          <div className="mt-3 text-xs font-bold text-white bg-emerald-600 py-1 px-3.5 rounded-lg inline-block shadow-xs">
            {topStudents[0].badge} · {topStudents[0].streak} Streak
          </div>
        </div>

        {/* Rank 3 */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 text-center shadow-xs order-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-lg mb-2">
            3
          </div>
          <h3 className="font-bold text-emerald-950 text-base">
            {topStudents[2].name}
          </h3>
          <div className="text-2xl font-extrabold text-emerald-900 my-1">
            {topStudents[2].score} / 400
          </div>
          <div className="text-xs text-slate-500">{topStudents[2].subjects}</div>
          <div className="mt-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1 px-3 rounded-lg inline-block">
            {topStudents[2].streak} Study Streak
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs my-8">
        <div className="p-6 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950">
            Top Scoring Candidates This Cycle
          </h2>
          <button
            onClick={onStartQuiz}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Take CBT Mock Exam</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50 text-xs font-bold text-emerald-900 uppercase tracking-wider border-b border-emerald-200">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Candidate Name</th>
                <th className="px-6 py-3.5">Score (/400)</th>
                <th className="px-6 py-3.5">Combination</th>
                <th className="px-6 py-3.5">Study Streak</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {topStudents.map((st) => (
                <tr key={st.rank} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-emerald-950">
                    #{st.rank}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {st.name}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-emerald-700">
                    {st.score}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {st.subjects}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {st.streak}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {st.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
