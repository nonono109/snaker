import React from 'react';
import { GameStatus, Difficulty } from '../types';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface OverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  setDifficulty: (d: Difficulty) => void;
  currentDifficulty: Difficulty;
}

const Overlay: React.FC<OverlayProps> = ({ 
  status, 
  score, 
  highScore, 
  onStart, 
  onRestart,
  setDifficulty,
  currentDifficulty
}) => {
  if (status === GameStatus.PLAYING) return null;

  const isGameOver = status === GameStatus.GAME_OVER;
  const isPaused = status === GameStatus.PAUSED;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-lg">
      <div className="text-center p-8 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
        
        {isGameOver && (
          <div className="mb-6">
            <h2 className="text-4xl font-black text-neon-red mb-2 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,7,58,0.5)]">Game Over</h2>
            <div className="flex flex-col gap-2 text-slate-300">
                <p className="text-xl">Score: <span className="text-white font-mono text-2xl">{score}</span></p>
                {score >= highScore && score > 0 && (
                    <p className="text-neon-blue font-bold animate-pulse">New High Score!</p>
                )}
            </div>
          </div>
        )}

        {status === GameStatus.IDLE && (
          <div className="mb-8">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue mb-2 tracking-tighter">
              SNAKE
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
                <Trophy size={16} className="text-yellow-400" />
                <span className="font-mono">Best: {highScore}</span>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-bold">Select Speed</p>
              <div className="flex justify-center gap-2">
                {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>)
                 .filter(k => isNaN(Number(k)))
                 .map((key) => {
                    const value = Difficulty[key];
                    const isActive = currentDifficulty === value;
                    return (
                        <button
                            key={key}
                            onClick={() => setDifficulty(value)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                isActive 
                                ? 'bg-neon-blue text-slate-900 shadow-[0_0_10px_rgba(15,240,252,0.5)]' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                        >
                            {key}
                        </button>
                    )
                 })}
              </div>
            </div>
          </div>
        )}

        {isPaused && (
           <h2 className="text-4xl font-bold text-white mb-8 tracking-widest">PAUSED</h2>
        )}

        <button
          onClick={isGameOver ? onRestart : onStart}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-neon-green text-slate-900 font-bold text-lg rounded-xl overflow-hidden transition-transform active:scale-95 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] w-full"
        >
          {isGameOver ? <RotateCcw size={24} /> : <Play size={24} />}
          <span>{isGameOver ? "Try Again" : (isPaused ? "Resume" : "Start Game")}</span>
        </button>
      </div>
    </div>
  );
};

export default Overlay;