import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types';

interface ControlsProps {
  onDirectionChange: (dir: Direction) => void;
}

const Controls: React.FC<ControlsProps> = ({ onDirectionChange }) => {
  const btnClass = "bg-slate-800/80 backdrop-blur active:bg-neon-blue/20 active:scale-95 transition-all duration-75 border-2 border-slate-600 rounded-xl p-4 flex items-center justify-center shadow-lg";
  const iconClass = "w-8 h-8 text-slate-200";

  return (
    <div className="grid grid-cols-3 gap-2 mt-4 max-w-[200px] mx-auto select-none">
      <div className="col-start-2">
        <button 
          className={btnClass}
          onClick={() => onDirectionChange(Direction.UP)}
          aria-label="Up"
        >
          <ArrowUp className={iconClass} />
        </button>
      </div>
      <div className="col-start-1 row-start-2">
        <button 
          className={btnClass}
          onClick={() => onDirectionChange(Direction.LEFT)}
          aria-label="Left"
        >
          <ArrowLeft className={iconClass} />
        </button>
      </div>
      <div className="col-start-2 row-start-2">
        <button 
          className={btnClass}
          onClick={() => onDirectionChange(Direction.DOWN)}
          aria-label="Down"
        >
          <ArrowDown className={iconClass} />
        </button>
      </div>
      <div className="col-start-3 row-start-2">
        <button 
          className={btnClass}
          onClick={() => onDirectionChange(Direction.RIGHT)}
          aria-label="Right"
        >
          <ArrowRight className={iconClass} />
        </button>
      </div>
    </div>
  );
};

export default Controls;