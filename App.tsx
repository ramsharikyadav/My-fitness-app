
import React, { useState, useEffect, useMemo } from 'react';
import { WORKOUT_PLAN, DIET_PLAN, CONSTANT_MEALS, DAYS, TEXTS } from './constants';
import { DayOfWeek, WorkoutDay, Recipe, Language, View, HistoryRecord, ExerciseHelp } from './types';
import { WorkoutList } from './components/WorkoutList';
import { DietTracker } from './components/DietTracker';
import { OfficeTimer } from './components/OfficeTimer';
import { HabitTargets } from './components/HabitTargets';
import { RecipeModal } from './components/RecipeModal';
import { ProgressTracker } from './components/ProgressTracker';
import { SettingsManager } from './components/SettingsManager';
import { WorkoutHelpModal } from './components/WorkoutHelpModal';
import { getDailyMotivation, getRecipe, getExerciseHelp } from './geminiService';
import { Calendar, BrainCircuit, ChevronLeft, ChevronRight, UserCircle, Settings, Languages, BarChart3, Target } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('fitflow_lang');
    return (saved as Language) || 'en';
  });

  const [activeView, setActiveView] = useState<View>('today');
  const t = TEXTS[lang];

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const d = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
    return DAYS.includes(d) ? d : 'Monday';
  });

  const [workouts, setWorkouts] = useState<Record<Language, Record<DayOfWeek, WorkoutDay>>>(() => {
    const saved = localStorage.getItem('fitflow_workouts_state');
    return saved ? JSON.parse(saved) : WORKOUT_PLAN;
  });

  const [motivation, setMotivation] = useState<string>(t.fetchingMotivation);
  const [stats, setStats] = useState({
    steps: 2400,
    water: 3,
    fruits: 0,
    walk: 0
  });

  // User defined goal for diet adherence (number of meals)
  const [dietGoal, setDietGoal] = useState<number>(() => {
    const saved = localStorage.getItem('fitflow_diet_goal');
    return saved ? parseInt(saved) : 4;
  });

  // Meal Completion Tracking
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`fitflow_meals_${today}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Persistence: History
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem('fitflow_history');
    if (saved) return JSON.parse(saved);
    
    const mockData: HistoryRecord[] = [];
    for (let i = 7; i > 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      mockData.push({
        date: d.toISOString().split('T')[0],
        steps: Math.floor(Math.random() * 8000) + 1000,
        water: Math.floor(Math.random() * 8) + 2,
        fruits: Math.random() > 0.5 ? 1 : 0,
        walk: Math.floor(Math.random() * 15),
        workoutCompleted: Math.floor(Math.random() * 100),
        dietAdherence: Math.random() > 0.3
      });
    }
    return mockData;
  });

  // Sync today's stats into history
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentDayWorkout = workouts[lang][selectedDay];
    const completedWorkout = currentDayWorkout.exercises;
    const workoutPct = Math.round((completedWorkout.filter(e => e.completed).length / completedWorkout.length) * 100);

    // Calculate diet adherence: True if completed meals meet or exceed the user's goal
    const completedMealCount = Object.values(completedMeals).filter(Boolean).length;
    const isDietAdherent = completedMealCount >= dietGoal;

    setHistory(prev => {
      const existing = prev.find(h => h.date === today);
      const newRecord: HistoryRecord = {
        date: today,
        steps: stats.steps,
        water: stats.water,
        fruits: stats.fruits,
        walk: stats.walk,
        workoutCompleted: workoutPct,
        dietAdherence: isDietAdherent
      };

      if (existing) {
        if (JSON.stringify(existing) === JSON.stringify(newRecord)) return prev;
        return prev.map(h => h.date === today ? newRecord : h);
      }
      return [...prev, newRecord];
    });

    localStorage.setItem(`fitflow_meals_${today}`, JSON.stringify(completedMeals));
    localStorage.setItem('fitflow_diet_goal', dietGoal.toString());
    localStorage.setItem('fitflow_workouts_state', JSON.stringify(workouts));
  }, [stats, workouts, lang, selectedDay, completedMeals, dietGoal]);

  useEffect(() => {
    localStorage.setItem('fitflow_history', JSON.stringify(history));
  }, [history]);

  // Recipe States
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('fitflow_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Workout Help States
  const [activeHelp, setActiveHelp] = useState<ExerciseHelp | null>(null);
  const [isHelpLoading, setIsHelpLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('fitflow_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('fitflow_lang', lang);
  }, [lang]);

  // Load motivation from Gemini
  useEffect(() => {
    const fetchMotivation = async () => {
      setMotivation(t.fetchingMotivation);
      const tip = await getDailyMotivation(selectedDay, workouts[lang][selectedDay].title, lang);
      setMotivation(tip);
    };
    fetchMotivation();
  }, [selectedDay, lang]);

  const toggleExercise = (index: number) => {
    setWorkouts(prev => {
      const updated = { ...prev };
      const currentDayWorkout = { ...updated[lang][selectedDay] };
      const currentExercises = [...currentDayWorkout.exercises];
      currentExercises[index] = { ...currentExercises[index], completed: !currentExercises[index].completed };
      currentDayWorkout.exercises = currentExercises;
      updated[lang][selectedDay] = currentDayWorkout;
      return updated;
    });
  };

  const updateExerciseReps = (index: number, reps: string) => {
    setWorkouts(prev => {
      const updated = { ...prev };
      const currentDayWorkout = { ...updated[lang][selectedDay] };
      const currentExercises = [...currentDayWorkout.exercises];
      currentExercises[index] = { ...currentExercises[index], completedReps: reps };
      currentDayWorkout.exercises = currentExercises;
      updated[lang][selectedDay] = currentDayWorkout;
      return updated;
    });
  };

  const handleShowHelp = async (exerciseName: string) => {
    setIsHelpLoading(true);
    const help = await getExerciseHelp(exerciseName, lang);
    setActiveHelp(help);
    setIsHelpLoading(false);
  };

  const toggleMeal = (mealId: string) => {
    setCompletedMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  const updateStat = (key: string, val: number) => {
    setStats(prev => ({ ...prev, [key]: val }));
  };

  const handleViewRecipe = async (description: string) => {
    const cached = favorites.find(f => f.name.toLowerCase() === description.toLowerCase() || f.id === description);
    if (cached) {
      setActiveRecipe(cached);
      return;
    }

    setIsRecipeLoading(true);
    const recipe = await getRecipe(description, lang);
    setActiveRecipe(recipe);
    setIsRecipeLoading(false);
  };

  const toggleFavorite = (recipe: Recipe) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === recipe.id);
      if (exists) {
        return prev.filter(f => f.id !== recipe.id);
      }
      return [...prev, recipe];
    });
  };

  const currentWorkout = workouts[lang][selectedDay];
  const currentDiet = DIET_PLAN[lang][selectedDay];

  const handleDayShift = (direction: 'next' | 'prev') => {
    const currentIndex = DAYS.indexOf(selectedDay);
    if (direction === 'next') {
      setSelectedDay(DAYS[(currentIndex + 1) % 7]);
    } else {
      setSelectedDay(DAYS[(currentIndex - 1 + 7) % 7]);
    }
  };

  const getDayNameTranslation = (day: DayOfWeek) => {
    if (lang === 'en') return day;
    const hiDays: Record<DayOfWeek, string> = {
      Monday: 'सोमवार',
      Tuesday: 'मंगलवार',
      Wednesday: 'बुधवार',
      Thursday: 'गुरुवार',
      Friday: 'शुक्रवार',
      Saturday: 'शनिवार',
      Sunday: 'रविवार'
    };
    return hiDays[day];
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative bg-[#F8FAFC]">
      {/* Header */}
      <header className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveView('today')}
              className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 cursor-pointer"
            >
              F
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{activeView === 'settings' ? t.settings : t.welcome}</h1>
              <p className="text-xs text-gray-500">{activeView === 'settings' ? t.appPreferences : t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveView(activeView === 'settings' ? 'today' : 'settings')}
              className={`p-2 rounded-xl shadow-sm border transition-colors ${activeView === 'settings' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-gray-400 border-gray-100 hover:text-indigo-600'}`}
            >
              <Settings className="w-6 h-6" />
            </button>
            <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <UserCircle className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {activeView === 'today' && (
          <>
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <button onClick={() => handleDayShift('prev')} className="p-2 hover:bg-gray-50 rounded-xl">
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-gray-700">{getDayNameTranslation(selectedDay)}</span>
              </div>
              <button onClick={() => handleDayShift('next')} className="p-2 hover:bg-gray-50 rounded-xl">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-3xl shadow-xl shadow-indigo-100 text-white mb-6 overflow-hidden relative">
              <BrainCircuit className="absolute -bottom-2 -right-2 w-24 h-24 opacity-10" />
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2">{t.coachSays}</p>
              <p className="text-sm font-medium leading-relaxed italic">
                "{motivation}"
              </p>
            </div>
          </>
        )}
      </header>

      <main className="px-6 space-y-6">
        {activeView === 'today' ? (
          <>
            <HabitTargets stats={stats} updateStat={updateStat} lang={lang} />
            
            <OfficeTimer lang={lang} />

            <div className="space-y-6">
              <WorkoutList 
                workout={currentWorkout} 
                onToggle={toggleExercise} 
                onShowHelp={handleShowHelp}
                onUpdateReps={updateExerciseReps}
                lang={lang}
              />
              
              <div className="relative">
                <div className="absolute right-6 top-6 z-10 flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                  <Target className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-700">Goal:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="6"
                    value={dietGoal}
                    onChange={(e) => setDietGoal(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                    className="w-8 bg-transparent text-[10px] font-bold text-emerald-700 focus:outline-none"
                  />
                </div>
                <DietTracker 
                  diet={currentDiet} 
                  constantMeals={CONSTANT_MEALS[lang]} 
                  onViewRecipe={handleViewRecipe}
                  favorites={favorites}
                  lang={lang}
                  completedMeals={completedMeals}
                  onToggleMeal={toggleMeal}
                />
              </div>
            </div>
          </>
        ) : activeView === 'progress' ? (
          <ProgressTracker history={history} lang={lang} />
        ) : (
          <SettingsManager 
            lang={lang} 
            setLang={setLang} 
            dietGoal={dietGoal} 
            setDietGoal={setDietGoal} 
          />
        )}
      </main>

      <RecipeModal 
        recipe={activeRecipe}
        isLoading={isRecipeLoading}
        onClose={() => setActiveRecipe(null)}
        isFavorite={!!activeRecipe && favorites.some(f => f.id === activeRecipe.id)}
        onToggleFavorite={toggleFavorite}
        lang={lang}
      />

      <WorkoutHelpModal 
        help={activeHelp}
        isLoading={isHelpLoading}
        onClose={() => setActiveHelp(null)}
        lang={lang}
      />

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 px-6 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveView('today')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'today' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t.today}</span>
        </button>
        
        <div className="relative -top-10">
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveView('today');
            }}
            className={`w-14 h-14 rounded-full shadow-xl transition-all active:scale-95 flex items-center justify-center text-white ${activeView === 'today' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-400 shadow-gray-200'}`}
          >
            <Dumbbell className="w-7 h-7" />
          </button>
        </div>

        <button 
          onClick={() => setActiveView('progress')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'progress' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold">{t.progress}</span>
        </button>
      </nav>
    </div>
  );
};

const Dumbbell: React.FC<any> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
);

export default App;
