
import React, { useRef } from 'react';
import { WorkoutDay, Language } from '../types';
import { CheckCircle2, Circle, Dumbbell, Info, Edit3 } from 'lucide-react';
import { TEXTS } from '../constants';

interface Props {
  workout: WorkoutDay;
  onToggle: (index: number) => void;
  onShowHelp: (exerciseName: string) => void;
  onUpdateReps: (index: number, reps: string) => void;
  lang: Language;
}

export const WorkoutList: React.FC<Props> = ({ workout, onToggle, onShowHelp, onUpdateReps, lang }) => {
  const t = TEXTS[lang];
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const completedCount = workout.exercises.filter(e => e.completed).length;
  const progress = (completedCount / workout.exercises.length) * 100;

  const playToggleSound = (isCompleting: boolean) => {
    // Check global sound preferences
    const masterSound = localStorage.getItem('fitflow_sound_enabled') !== 'false';
    const interactionsSound = localStorage.getItem('fitflow_sound_interactions') !== 'false';
    
    if (!masterSound || !interactionsSound) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      
      if (isCompleting) {
        // High pitched "Success" chime
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        // Lower pitched "Uncheck" blip
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  };

  const handleToggle = (idx: number, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    playToggleSound(!currentStatus);
    onToggle(idx);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-50 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-indigo-500" />
            {workout.title} {t.workout}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{t.session}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="w-full bg-indigo-50 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-indigo-500 h-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {workout.exercises.map((ex, idx) => (
          <div 
            key={idx}
            className={`flex items-center justify-between p-3 rounded-xl cursor-default transition-all border ${
              ex.completed ? 'bg-indigo-50 border-indigo-100 opacity-60' : 'bg-white border-gray-100 hover:border-indigo-200'
            }`}
          >
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm truncate ${ex.completed ? 'line-through text-indigo-700' : 'text-gray-700'}`}>
                  {ex.name}
                </span>
                <button 
                  onClick={() => onShowHelp(ex.name)}
                  className="p-1 text-indigo-300 hover:text-indigo-600 transition-colors flex-shrink-0"
                  title="How to do it?"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{ex.reps}</span>
            </div>
            
            <div className="flex items-center gap-2 px-2">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="0"
                  value={ex.completedReps || ''}
                  onChange={(e) => onUpdateReps(idx, e.target.value)}
                  className={`w-12 h-8 text-center text-xs font-bold rounded-lg border focus:ring-2 focus:ring-indigo-400 outline-none transition-all ${
                    ex.completed ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-white'
                  }`}
                />
                <Edit3 className="w-2.5 h-2.5 absolute -top-1.5 -right-1.5 text-gray-300 group-hover:text-indigo-400" />
              </div>
            </div>

            <button 
              onClick={(e) => handleToggle(idx, ex.completed, e)}
              className="p-1 flex-shrink-0"
            >
              {ex.completed ? (
                <CheckCircle2 className="w-7 h-7 text-indigo-500" />
              ) : (
                <Circle className="w-7 h-7 text-gray-300" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
