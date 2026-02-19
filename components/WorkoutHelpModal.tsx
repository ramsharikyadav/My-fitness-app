
import React from 'react';
import { ExerciseHelp, Language } from '../types';
import { X, Lightbulb, AlertCircle, ChevronRight } from 'lucide-react';
import { TEXTS } from '../constants';

interface Props {
  help: ExerciseHelp | null;
  isLoading: boolean;
  onClose: () => void;
  lang: Language;
}

export const WorkoutHelpModal: React.FC<Props> = ({ help, isLoading, onClose, lang }) => {
  const t = TEXTS[lang];
  if (!help && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
              {isLoading ? (lang === 'hi' ? 'सीख रहे हैं...' : 'Learning form...') : help?.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-0">
          {isLoading ? (
            <div className="p-6 space-y-6">
              <div className="w-full aspect-video bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generating Visual...</p>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
                <div className="space-y-2 pt-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-50 rounded-xl w-full animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ) : help ? (
            <div className="space-y-0">
              {/* AI Generated Visualization */}
              {help.imageUrl && (
                <div className="w-full aspect-video bg-gray-50 relative overflow-hidden group">
                  <img 
                    src={help.imageUrl} 
                    alt={help.name} 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                      AI VISUALIZATION
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {help.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Key Form Tips</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {help.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                          <ChevronRight className="w-3 h-3" />
                        </div>
                        <p className="text-xs font-bold text-indigo-900">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
                  <div className="p-1.5 bg-white rounded-lg text-red-500 shadow-sm h-fit">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Common Mistake</h4>
                    <p className="text-xs font-bold text-red-800 leading-snug">
                      {help.mistake}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            {t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
