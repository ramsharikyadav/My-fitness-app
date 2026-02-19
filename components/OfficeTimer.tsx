
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Settings2, BellRing, Save, Droplets, Volume2, VolumeX, RotateCcw, Play, X } from 'lucide-react';
import { Language } from '../types';
import { TEXTS } from '../constants';

interface Props {
  lang: Language;
}

export const OfficeTimer: React.FC<Props> = ({ lang }) => {
  const t = TEXTS[lang];
  const audioContextRef = useRef<AudioContext | null>(null);
  const today = new Date().toISOString().split('T')[0];
  
  // Persistent Settings
  const [moveMinutes, setMoveMinutes] = useState(() => {
    const saved = localStorage.getItem('fitflow_move_mins');
    return saved ? parseInt(saved) : 45;
  });
  const [moveMessage, setMoveMessage] = useState(() => {
    const saved = localStorage.getItem('fitflow_move_msg');
    return saved || (lang === 'hi' ? "खड़े हो जाओ, 2-3 मिनट टहलो, या 15 स्कवाट्स करो!" : "Stand up, walk for 2-3 mins, or do 15 squats!");
  });

  const [waterMinutes, setWaterMinutes] = useState(() => {
    const saved = localStorage.getItem('fitflow_water_mins');
    return saved ? parseInt(saved) : 60;
  });
  const [waterMessage, setWaterMessage] = useState(() => {
    const saved = localStorage.getItem('fitflow_water_msg');
    return saved || (lang === 'hi' ? "हाइड्रेटेड रहें! एक गिलास पानी पिएं।" : "Stay hydrated! Drink a glass of water.");
  });

  // Daily Counts Persistence
  const [moveCount, setMoveCount] = useState(() => {
    const saved = localStorage.getItem(`fitflow_move_count_${today}`);
    return saved ? parseInt(saved) : 0;
  });
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem(`fitflow_water_count_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  // Timer States
  const [moveTimeLeft, setMoveTimeLeft] = useState(moveMinutes * 60);
  const [moveIsActive, setMoveIsActive] = useState(false);
  const [waterTimeLeft, setWaterTimeLeft] = useState(waterMinutes * 60);
  const [waterIsActive, setWaterIsActive] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  // Sync counts to localStorage
  useEffect(() => {
    localStorage.setItem(`fitflow_move_count_${today}`, moveCount.toString());
  }, [moveCount, today]);

  useEffect(() => {
    localStorage.setItem(`fitflow_water_count_${today}`, waterCount.toString());
  }, [waterCount, today]);

  // Audio Logic respecting global settings
  const playAlarmSound = (frequency: number) => {
    const masterSound = localStorage.getItem('fitflow_sound_enabled') !== 'false';
    const remindersSound = localStorage.getItem('fitflow_sound_reminders') !== 'false';
    const globalFreq = localStorage.getItem('fitflow_alarm_frequency');
    const finalFreq = globalFreq ? parseInt(globalFreq) : frequency;

    if (!masterSound || !remindersSound) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(finalFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(finalFreq / 2, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  // Movement Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (moveIsActive && moveTimeLeft > 0) {
      interval = setInterval(() => {
        setMoveTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (moveTimeLeft === 0 && moveIsActive) {
      setMoveIsActive(false);
      playAlarmSound(880);
      if (Notification.permission === 'granted') {
        new Notification(t.timeToMove, { body: moveMessage });
      }
      setMoveCount(prev => prev + 1);
    }
    return () => clearInterval(interval);
  }, [moveIsActive, moveTimeLeft, moveMessage, t.timeToMove]);

  // Water Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (waterIsActive && waterTimeLeft > 0) {
      interval = setInterval(() => {
        setWaterTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (waterTimeLeft === 0 && waterIsActive) {
      setWaterIsActive(false);
      playAlarmSound(1100);
      if (Notification.permission === 'granted') {
        new Notification(t.timeToHydrate, { body: waterMessage });
      }
      setWaterCount(prev => prev + 1);
    }
    return () => clearInterval(interval);
  }, [waterIsActive, waterTimeLeft, waterMessage, t.timeToHydrate]);

  const saveSettings = () => {
    localStorage.setItem('fitflow_move_mins', moveMinutes.toString());
    localStorage.setItem('fitflow_move_msg', moveMessage);
    localStorage.setItem('fitflow_water_mins', waterMinutes.toString());
    localStorage.setItem('fitflow_water_msg', waterMessage);
    
    if (!moveIsActive) setMoveTimeLeft(moveMinutes * 60);
    if (!waterIsActive) setWaterTimeLeft(waterMinutes * 60);
    setShowSettings(false);
  };

  const resetToDefaults = () => {
    const defMoveMins = 45;
    const defMoveMsg = lang === 'hi' ? "खड़े हो जाओ, 2-3 मिनट टहलो, या 15 स्कवाट्स करो!" : "Stand up, walk for 2-3 mins, or do 15 squats!";
    const defWaterMins = 60;
    const defWaterMsg = lang === 'hi' ? "हाइड्रेटेड रहें! एक गिलास पानी पिएं।" : "Stay hydrated! Drink a glass of water.";

    setMoveMinutes(defMoveMins);
    setMoveMessage(defMoveMsg);
    setWaterMinutes(defWaterMins);
    setWaterMessage(defWaterMsg);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 mb-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-500" />
          {t.officeBuddy}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {showSettings ? (
        <div className="mb-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-orange-100 pb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Buddy Settings</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={resetToDefaults}
                className="text-[10px] flex items-center gap-1 text-gray-500 font-bold hover:underline"
              >
                <RotateCcw className="w-3 h-3" /> {t.reset}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Movement</h4>
              <input 
                type="number" 
                value={moveMinutes}
                onChange={(e) => setMoveMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-orange-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none"
                placeholder="Mins"
              />
              <textarea 
                value={moveMessage}
                onChange={(e) => setMoveMessage(e.target.value)}
                className="w-full bg-white border border-orange-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none min-h-[60px]"
                placeholder="Message"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Water</h4>
              <input 
                type="number" 
                value={waterMinutes}
                onChange={(e) => setWaterMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Mins"
              />
              <textarea 
                value={waterMessage}
                onChange={(e) => setWaterMessage(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none min-h-[60px]"
                placeholder="Message"
              />
            </div>
          </div>

          <div className="flex gap-2">
             <button 
              onClick={() => setShowSettings(false)}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-xs hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              onClick={saveSettings}
              className="flex-[2] bg-orange-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100"
            >
              <Save className="w-3.5 h-3.5" />
              {t.saveSettings}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-orange-600 uppercase">Movement Reminder</span>
              <span className="text-[10px] font-bold text-gray-400">{moveCount}/8 {t.daily}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-mono font-bold w-20 ${moveTimeLeft < 300 && moveIsActive ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                {formatTime(moveTimeLeft)}
              </div>
              <div className="flex gap-2 flex-1">
                {!moveIsActive ? (
                  <button
                    onClick={() => {
                        setMoveIsActive(true);
                        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
                  >
                    {t.startFocus}
                  </button>
                ) : (
                  <button
                    onClick={() => setMoveIsActive(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded-xl transition-all"
                  >
                    {t.pause}
                  </button>
                )}
                <button
                  onClick={() => { setMoveTimeLeft(moveMinutes * 60); setMoveIsActive(true); }}
                  className="px-3 bg-white text-orange-600 border border-orange-200 text-xs font-bold py-2 rounded-xl hover:bg-orange-50 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {moveTimeLeft === 0 && (
              <p className="mt-2 text-center text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 flex items-center justify-center gap-2 italic animate-bounce">
                <BellRing className="w-3.5 h-3.5" /> "{moveMessage}"
              </p>
            )}
          </div>

          <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Hydration Reminder</span>
              <span className="text-[10px] font-bold text-gray-400">{waterCount} {t.unitGlasses}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-mono font-bold w-20 ${waterTimeLeft < 300 && waterIsActive ? 'text-blue-500 animate-pulse' : 'text-gray-700'}`}>
                {formatTime(waterTimeLeft)}
              </div>
              <div className="flex gap-2 flex-1">
                {!waterIsActive ? (
                  <button
                    onClick={() => {
                        setWaterIsActive(true);
                        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-blue-100"
                  >
                    {t.startFocus}
                  </button>
                ) : (
                  <button
                    onClick={() => setWaterIsActive(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded-xl transition-all"
                  >
                    {t.pause}
                  </button>
                )}
                <button
                  onClick={() => { setWaterTimeLeft(waterMinutes * 60); setWaterIsActive(true); }}
                  className="px-3 bg-white text-blue-600 border border-blue-200 text-xs font-bold py-2 rounded-xl hover:bg-blue-50 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {waterTimeLeft === 0 && (
              <p className="mt-2 text-center text-[10px] text-blue-600 font-bold bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center justify-center gap-2 italic animate-bounce">
                <Droplets className="w-3.5 h-3.5" /> "{waterMessage}"
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button 
                onClick={() => {
                    if (Notification.permission !== 'granted') {
                        Notification.requestPermission();
                    } else {
                        new Notification("FitFlow Test", { body: "Browser notifications are enabled!" });
                    }
                }}
                className="w-full text-[10px] text-gray-400 underline hover:text-gray-600 text-center"
            >
                {t.enableReminders}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
