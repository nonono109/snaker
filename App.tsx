import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Direction, Point, Difficulty } from './types';
import { GRID_SIZE, INITIAL_SNAKE, INITIAL_DIFFICULTY, KEY_MAPPINGS } from './constants';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import Overlay from './components/Overlay';
import { Pause, Volume2, VolumeX, Play } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('snake-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(INITIAL_DIFFICULTY);
  
  // Refs for state that updates frequently to avoid stale closures in effects
  const directionRef = useRef<Direction>(Direction.UP);
  const lastProcessedDirectionRef = useRef<Direction>(Direction.UP);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Logic Helpers ---

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isColliding;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isColliding = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isColliding);
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    lastProcessedDirectionRef.current = Direction.UP;
    setScore(0);
    setFood(generateFood(INITIAL_SNAKE));
    setStatus(GameStatus.PLAYING);
  };

  const gameOver = () => {
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', score.toString());
    }
  };

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;

      const newHead = { ...head };

      switch (currentDir) {
        case Direction.UP:
          newHead.y -= 1;
          break;
        case Direction.DOWN:
          newHead.y += 1;
          break;
        case Direction.LEFT:
          newHead.x -= 1;
          break;
        case Direction.RIGHT:
          newHead.x += 1;
          break;
      }

      // Check Walls
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        gameOver();
        return prevSnake;
      }

      // Check Self Collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check Food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        // Don't pop tail (grow)
      } else {
        newSnake.pop(); // Remove tail
      }

      return newSnake;
    });
  }, [food, generateFood, score, highScore]); // Dependencies

  // --- Effects ---

  // Game Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      gameLoopRef.current = setInterval(moveSnake, difficulty);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [status, moveSnake, difficulty]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (status === GameStatus.IDLE && (e.key === 'Enter' || e.key === ' ')) {
        resetGame();
        return;
      }
      
      if (status === GameStatus.GAME_OVER && (e.key === 'Enter' || e.key === ' ')) {
        resetGame();
        return;
      }

      if (status === GameStatus.PLAYING && e.key === ' ') {
        setStatus(GameStatus.PAUSED);
        return;
      }

      if (status === GameStatus.PAUSED && e.key === ' ') {
        setStatus(GameStatus.PLAYING);
        return;
      }

      if (status !== GameStatus.PLAYING) return;

      const mappedDir = KEY_MAPPINGS[e.key];
      if (!mappedDir) return;

      const current = lastProcessedDirectionRef.current;
      
      // Prevent 180 degree turns
      if (mappedDir === 'UP' && current === Direction.DOWN) return;
      if (mappedDir === 'DOWN' && current === Direction.UP) return;
      if (mappedDir === 'LEFT' && current === Direction.RIGHT) return;
      if (mappedDir === 'RIGHT' && current === Direction.LEFT) return;

      directionRef.current = mappedDir as Direction;
      setDirection(mappedDir as Direction); // Trigger re-render for UI if needed
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Mobile Control Handler
  const handleManualDirection = (newDir: Direction) => {
    if (status !== GameStatus.PLAYING) return;
    
    const current = lastProcessedDirectionRef.current;
    if (newDir === Direction.UP && current === Direction.DOWN) return;
    if (newDir === Direction.DOWN && current === Direction.UP) return;
    if (newDir === Direction.LEFT && current === Direction.RIGHT) return;
    if (newDir === Direction.RIGHT && current === Direction.LEFT) return;

    directionRef.current = newDir;
    setDirection(newDir);
  };

  const togglePause = () => {
    if (status === GameStatus.PLAYING) setStatus(GameStatus.PAUSED);
    else if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-mono text-slate-100 overflow-hidden relative">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      {/* Header / HUD */}
      <div className="relative z-10 w-full max-w-[500px] flex items-center justify-between mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div className="flex flex-col">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Score</span>
           <span className="text-2xl font-bold text-neon-green leading-none">{score}</span>
        </div>
        
        <div className="flex items-center gap-4">
             {status === GameStatus.PLAYING || status === GameStatus.PAUSED ? (
                 <button 
                  onClick={togglePause}
                  className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                 >
                   {status === GameStatus.PAUSED ? <Play size={20} className="fill-current text-neon-blue" /> : <Pause size={20} className="fill-current text-slate-300" />}
                 </button>
             ) : <div className="w-9 h-9"></div>}
             
             <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">High Score</span>
                <span className="text-xl font-bold text-white leading-none">{highScore}</span>
             </div>
        </div>
      </div>

      {/* Game Area Wrapper */}
      <div className="relative z-10">
        <Overlay 
            status={status} 
            score={score} 
            highScore={highScore}
            onStart={resetGame}
            onRestart={resetGame}
            setDifficulty={setDifficulty}
            currentDifficulty={difficulty}
        />
        <GameBoard snake={snake} food={food} gridSize={GRID_SIZE} />
      </div>

      {/* Mobile Controls */}
      <div className="relative z-10 w-full max-w-[500px] mt-6 lg:hidden">
          <Controls onDirectionChange={handleManualDirection} />
      </div>

      {/* Desktop Hint */}
      <div className="hidden lg:block mt-8 text-slate-500 text-sm">
        Use <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300">Arrow Keys</kbd> or <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300">WASD</kbd> to move. Space to pause.
      </div>

    </div>
  );
};

export default App;