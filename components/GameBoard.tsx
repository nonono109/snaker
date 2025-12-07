import React from 'react';
import { GRID_SIZE } from '../constants';
import { Point } from '../types';

interface GameBoardProps {
  snake: Point[];
  food: Point;
  gridSize: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, gridSize }) => {
  // Create a flat array for the grid to map over easily
  const gridCells = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const x = i % gridSize;
    const y = Math.floor(i / gridSize);
    return { x, y, id: i };
  });

  return (
    <div 
      className="relative bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl shadow-neon-blue/10 overflow-hidden mx-auto"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        width: 'min(90vw, 500px)',
        height: 'min(90vw, 500px)',
      }}
    >
      {gridCells.map((cell) => {
        const isFood = cell.x === food.x && cell.y === food.y;
        const snakeIndex = snake.findIndex(s => s.x === cell.x && s.y === cell.y);
        const isHead = snakeIndex === 0;
        const isBody = snakeIndex > 0;

        let cellClass = "w-full h-full border-[0.5px] border-slate-800/30 transition-colors duration-150";

        // Styling Logic
        if (isHead) {
          return (
            <div key={cell.id} className={`${cellClass} bg-neon-green relative z-20`}>
              <div className="absolute inset-0 bg-neon-green blur-[4px] opacity-60"></div>
              {/* Eyes */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
          );
        }
        
        if (isBody) {
            // Gradient opacity for body tail
            const opacity = Math.max(0.4, 1 - snakeIndex / (snake.length + 5));
            return (
                <div key={cell.id} className={`${cellClass} bg-neon-green z-10`} style={{ opacity }} />
            )
        }

        if (isFood) {
          return (
            <div key={cell.id} className={`${cellClass} flex items-center justify-center relative`}>
               <div className="w-[80%] h-[80%] bg-neon-red rounded-full animate-pulse shadow-[0_0_10px_rgba(255,7,58,0.8)] z-10"></div>
            </div>
          );
        }

        return <div key={cell.id} className={cellClass} />;
      })}
    </div>
  );
};

export default GameBoard;