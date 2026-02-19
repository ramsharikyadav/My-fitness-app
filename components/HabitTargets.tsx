
import React from 'react';
import { Footprints, Droplets, Apple, Timer } from 'lucide-react';
import { Language } from '../types';
import { TEXTS } from '../constants';

interface HabitProps {
  label: string;
  target: string;
  current: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  unit: string;
  onAdd: () => void;
}

const HabitItem: React.FC<HabitProps> = ({ label, target, current, max, icon, color, unit, onAdd }) => {
  const progress = Math.min((current / max) * 100, 100);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-${color}`}>
          {icon}
        </div>
        <button 
          onClick={onAdd}
          className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          +
        </button>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-800">{current}</span>
          <span className="text-xs text-gray-400">/ {target} {unit}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
        <div 
          className={`h-full transition-all duration-700 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const HabitTargets: React.FC<{
  stats: any,
  updateStat: (key: string, val: number) => void,
  lang: Language
}> = ({ stats, updateStat, lang }) => {
  const t = TEXTS[lang];
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <HabitItem 
        label={t.steps}
        target="9000"
        unit={t.unitSteps}
        current={stats.steps}
        max={9000}
        color="text-blue-500"
        icon={<Footprints className="w-4 h-4" />}
        onAdd={() => updateStat('steps', stats.steps + 500)}
      />
      <HabitItem 
        label={t.water}
        target="10"
        unit={t.unitGlasses}
        current={stats.water}
        max={10}
        color="text-cyan-500"
        icon={<Droplets className="w-4 h-4" />}
        onAdd={() => updateStat('water', stats.water + 1)}
      />
      <HabitItem 
        label={t.fruits}
        target="1"
        unit={t.unitQty}
        current={stats.fruits}
        max={1}
        color="text-red-500"
        icon={<Apple className="w-4 h-4" />}
        onAdd={() => updateStat('fruits', stats.fruits + 1)}
      />
      <HabitItem 
        label={t.walk}
        target="15"
        unit={t.unitMin}
        current={stats.walk}
        max={15}
        color="text-green-500"
        icon={<Timer className="w-4 h-4" />}
        onAdd={() => updateStat('walk', stats.walk + 5)}
      />
    </div>
  );
};
