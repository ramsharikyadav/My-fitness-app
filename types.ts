
export type Language = 'en' | 'hi';
export type View = 'today' | 'progress' | 'settings';

export interface Exercise {
  name: string;
  reps: string;
  completed: boolean;
  completedReps?: string;
}

export interface WorkoutDay {
  title: string;
  exercises: Exercise[];
}

export interface ExerciseHelp {
  name: string;
  description: string;
  tips: string[];
  mistake: string;
  imageUrl: string;
}

export interface Meal {
  time: string;
  food: string;
}

export interface DietDay {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: string;
  prepTime: string;
}

export interface HistoryRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  water: number;
  fruits: number;
  walk: number;
  workoutCompleted: number; // percentage
  dietAdherence: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
