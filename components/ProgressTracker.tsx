
import React from 'react';
import { HistoryRecord, Language } from '../types';
import { TEXTS } from '../constants';
import { TrendingUp, Footprints, Droplets, CheckCircle2, Calendar } from 'lucide-react';

interface Props {
  history: HistoryRecord[];
  lang: Language;
}

export const ProgressTracker: React.FC<Props> = ({ history, lang }) => {
  const t = TEXTS[lang];
  
  // Calculate averages
  const avgSteps = Math.round(history.reduce((acc, curr) => acc + curr.steps, 0) / (history.length || 1));
  const totalWater = history.reduce((acc, curr) => acc + curr.water, 0);
  const avgWorkout = Math.round(history.reduce((acc, curr) => acc + curr.workoutCompleted, 0) / (history.length || 1));

  // Get last 7 days for the chart
  const recentDays = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            {t.weeklySummary}
          </h3>
          <Calendar className="w-4 h-4 text-gray-300" />
        </div>

        {/* Steps Bar Chart (Simple implementation) */}
        <div className="mb-8">
          <div className="flex items-end justify-between h-32 gap-2">
            {recentDays.map((day, idx) => {
              const height = (day.steps / 10000) * 100;
              const dateObj = new Date(day.date);
              const label = dateObj.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'narrow' });
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-indigo-100 rounded-t-lg relative group overflow-hidden"
                    style={{ height: `100%` }}
                  >
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all duration-1000"
                      style={{ height: `${Math.min(height, 100)}%` }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-indigo-600/10 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-bold text-indigo-700 -rotate-90">{day.steps}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4 font-medium">{t.steps} ({t.weeklySummary})</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <Footprints className="w-4 h-4 text-blue-500 mb-2" />
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t.avgSteps}</p>
            <p className="text-lg font-bold text-gray-800">{avgSteps}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
            <Droplets className="w-4 h-4 text-cyan-500 mb-2" />
            <p className="text-[10px] font-bold text-cyan-600 uppercase mb-1">{t.totalWater}</p>
            <p className="text-lg font-bold text-gray-800">{totalWater} <span className="text-xs text-gray-400">{t.unitGlasses}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          {t.completionRate}
        </h3>
        
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-emerald-50"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - avgWorkout / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="text-emerald-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800">{avgWorkout}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-gray-600 leading-tight">
              {lang === 'hi' ? 'आपकी साप्ताहिक फिटनेस कंसिस्टेंसी' : 'Your weekly fitness consistency'}
            </p>
            <div className="flex gap-1">
              {recentDays.map((day, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${day.workoutCompleted > 50 ? 'bg-emerald-500' : 'bg-gray-100'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold opacity-80 uppercase">{lang === 'hi' ? 'कोच की सलाह' : 'COACH ADVICE'}</p>
            <p className="text-sm font-medium">
              {avgSteps < 5000 
                ? (lang === 'hi' ? 'अपने कदमों को बढ़ाने की कोशिश करें!' : 'Try to push your step count higher!')
                : (lang === 'hi' ? 'शानदार निरंतरता! इसे बनाए रखें।' : 'Great consistency! Keep it up.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
