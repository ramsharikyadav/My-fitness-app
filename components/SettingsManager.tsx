
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, BellRing, Music, MousePointer2, Settings, Languages, Target, ChevronRight, Play } from 'lucide-react';
import { Language } from '../types';
import { TEXTS } from '../constants';

interface Props {
  lang: Language;
  setLang: (lang: Language) => void;
  dietGoal: number;
  setDietGoal: (goal: number) => void;
}

export const SettingsManager: React.FC<Props> = ({ lang, setLang, dietGoal, setDietGoal }) => {
  const t = TEXTS[lang];
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio Preferences States
  const [masterSound, setMasterSound] = useState(() => {
    const saved = localStorage.getItem('fitflow_sound_enabled');
    return saved === null ? true : saved === 'true';
  });
  const [reminderAlarms, setReminderAlarms] = useState(() => {
    const saved = localStorage.getItem('fitflow_sound_reminders');
    return saved === null ? true : saved === 'true';
  });
  const [interactionSounds, setInteractionSounds] = useState(() => {
    const saved = localStorage.getItem('fitflow_sound_interactions');
    return saved === null ? true : saved === 'true';
  });
  const [alarmTone, setAlarmTone] = useState(() => {
    const saved = localStorage.getItem('fitflow_alarm_frequency');
    return saved ? parseInt(saved) : 880;
  });

  // Persist Audio settings
  useEffect(() => {
    localStorage.setItem('fitflow_sound_enabled', masterSound.toString());
    localStorage.setItem('fitflow_sound_reminders', reminderAlarms.toString());
    localStorage.setItem('fitflow_sound_interactions', interactionSounds.toString());
    localStorage.setItem('fitflow_alarm_frequency', alarmTone.toString());
  }, [masterSound, reminderAlarms, interactionSounds, alarmTone]);

  const playTestSound = (freq: number) => {
    if (!masterSound) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio test failed", e);
    }
  };

  const tones = [
    { label: t.toneSoft, value: 440 },
    { label: t.toneMedium, value: 880 },
    { label: t.toneSharp, value: 1100 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Audio Settings Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Volume2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-800">{t.audioSettings}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              {masterSound ? <Volume2 className="w-5 h-5 text-indigo-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
              <span className="text-sm font-bold text-gray-700">{t.masterSound}</span>
            </div>
            <button 
              onClick={() => setMasterSound(!masterSound)}
              className={`w-12 h-6 rounded-full transition-colors relative ${masterSound ? 'bg-indigo-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${masterSound ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className={`space-y-4 transition-opacity ${masterSound ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-gray-500 uppercase">{t.reminderAlarms}</span>
              </div>
              <button 
                onClick={() => setReminderAlarms(!reminderAlarms)}
                className={`w-10 h-5 rounded-full transition-colors relative ${reminderAlarms ? 'bg-orange-400' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${reminderAlarms ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <MousePointer2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-gray-500 uppercase">{t.interactionSounds}</span>
              </div>
              <button 
                onClick={() => setInteractionSounds(!interactionSounds)}
                className={`w-10 h-5 rounded-full transition-colors relative ${interactionSounds ? 'bg-blue-400' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${interactionSounds ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">{t.alarmTone}</span>
              <div className="flex gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => {
                      setAlarmTone(tone.value);
                      playTestSound(tone.value);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      alarmTone === tone.value 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => playTestSound(alarmTone)}
              className="w-full mt-2 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors"
            >
              <Play className="w-4 h-4" />
              {t.testSound}
            </button>
          </div>
        </div>
      </div>

      {/* App Preferences Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-800">{t.appPreferences}</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-gray-700">{t.dietGoalLabel}</span>
            </div>
            <input 
              type="number" 
              min="1" 
              max="6"
              value={dietGoal}
              onChange={(e) => setDietGoal(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
              className="w-12 bg-gray-50 border border-gray-100 rounded-lg py-1 text-center font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold text-gray-700">{t.languageLabel}</span>
            </div>
            <button 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100 text-sm font-bold text-indigo-600 flex items-center gap-2"
            >
              {lang === 'en' ? 'English' : 'हिंदी'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold opacity-80 uppercase">FitFlow v2.1</p>
          <p className="text-sm font-medium">Healthy habits, loud and clear.</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-xl">
          F
        </div>
      </div>
    </div>
  );
};
