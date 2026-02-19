
import React from 'react';
import { DietDay, Recipe, Language } from '../types';
import { Coffee, Utensils, Moon, Sun, Apple, ChevronRight, Heart, CheckCircle2, Circle } from 'lucide-react';
import { TEXTS } from '../constants';

interface Props {
  diet: DietDay;
  constantMeals: {
    morning: string;
    midMorning: string;
    evening: string;
  };
  onViewRecipe: (description: string) => void;
  favorites: Recipe[];
  lang: Language;
  completedMeals: Record<string, boolean>;
  onToggleMeal: (mealId: string) => void;
}

export const DietTracker: React.FC<Props> = ({ 
  diet, 
  constantMeals, 
  onViewRecipe, 
  favorites, 
  lang,
  completedMeals,
  onToggleMeal
}) => {
  const t = TEXTS[lang];
  const mealSections = [
    { id: 'morning', label: t.morningStomach, content: constantMeals.morning, icon: <Sun className="w-4 h-4 text-amber-500" />, canViewRecipe: false },
    { id: 'breakfast', label: t.breakfast, content: diet.breakfast, icon: <Coffee className="w-4 h-4 text-indigo-500" />, canViewRecipe: true },
    { id: 'midMorning', label: t.midMorning, content: constantMeals.midMorning, icon: <Apple className="w-4 h-4 text-red-500" />, canViewRecipe: false },
    { id: 'lunch', label: t.lunch, content: diet.lunch, icon: <Utensils className="w-4 h-4 text-green-500" />, canViewRecipe: true },
    { id: 'evening', label: t.evening, content: constantMeals.evening, icon: <Coffee className="w-4 h-4 text-orange-500" />, canViewRecipe: true },
    { id: 'dinner', label: t.dinner, content: diet.dinner, icon: <Moon className="w-4 h-4 text-blue-500" />, canViewRecipe: true },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500" />
            {t.todaysFuel}
          </h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{t.clickForRecipes}</span>
        </div>

        <div className="space-y-4">
          {mealSections.map((m, i) => {
            const isCompleted = !!completedMeals[m.id];
            return (
              <div 
                key={i} 
                className={`flex gap-4 group transition-all duration-200 ${isCompleted ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full transition-all bg-gray-50`}>
                    {m.icon}
                  </div>
                  {i !== mealSections.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 my-1" />
                  )}
                </div>
                
                <div className="pb-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {m.label}
                    </p>
                    <div className="flex items-center gap-2">
                      {m.canViewRecipe && (
                        <button 
                          onClick={() => onViewRecipe(m.content)}
                          className="p-1 text-gray-300 hover:text-indigo-400 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => onToggleMeal(m.id)}
                        className={`transition-colors ${isCompleted ? 'text-emerald-500' : 'text-gray-200 hover:text-gray-300'}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <p 
                    onClick={() => m.canViewRecipe && onViewRecipe(m.content)}
                    className={`text-sm font-medium transition-all ${m.canViewRecipe ? 'cursor-pointer hover:text-indigo-600' : ''} ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}
                  >
                    {m.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[10px] text-red-600 font-bold mb-1">{t.proTip}</p>
          <p className="text-xs text-red-700">{t.proTipContent}</p>
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            {t.favoriteRecipes}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {favorites.map((fav) => (
              <div 
                key={fav.id}
                onClick={() => onViewRecipe(fav.name)}
                className="shrink-0 w-32 bg-red-50/30 border border-red-100 p-3 rounded-xl cursor-pointer hover:bg-red-50 transition-all"
              >
                <p className="text-xs font-bold text-gray-700 line-clamp-2 mb-1">{fav.name}</p>
                <div className="flex items-center gap-1 text-[9px] text-red-600 font-bold">
                  <Flame className="w-2.5 h-2.5" />
                  {fav.calories} kcal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Flame: React.FC<any> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);
