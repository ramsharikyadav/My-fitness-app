
import React from 'react';
import { Recipe, Language } from '../types';
import { X, Clock, Flame, Heart } from 'lucide-react';
import { TEXTS } from '../constants';

interface Props {
  recipe: Recipe | null;
  isLoading: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  lang: Language;
}

export const RecipeModal: React.FC<Props> = ({ recipe, isLoading, onClose, isFavorite, onToggleFavorite, lang }) => {
  const t = TEXTS[lang];
  if (!recipe && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
            {isLoading ? t.fetchingRecipe : recipe?.name}
          </h3>
          <div className="flex items-center gap-2">
            {!isLoading && recipe && (
              <button 
                onClick={() => onToggleFavorite(recipe)}
                className={`p-2 rounded-xl transition-all ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="flex gap-4">
                <div className="h-8 bg-gray-100 rounded w-24" />
                <div className="h-8 bg-gray-100 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ) : recipe ? (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {recipe.prepTime}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {recipe.calories} kcal
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.ingredients}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {ing}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.instructions}</h4>
                <div className="space-y-4">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Could not load recipe.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100"
          >
            {t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
