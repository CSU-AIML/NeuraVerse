import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import FuzzyText from "../components/ui/FuzzyText";

interface GlitchParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}

interface MatrixChar {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  color: string;
}

type GameType = 'none' | 'glitch' | 'snake' | 'memory' | 'reaction' | 'matrix';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState<GameType>('none');
  const matrixInputRef = useRef<HTMLInputElement>(null);
  
  // Glitch Game State
  const [glitchScore, setGlitchScore] = useState(0);
  const [glitchTimeLeft, setGlitchTimeLeft] = useState(30);
  const [particles, setParticles] = useState<GlitchParticle[]>([]);
  const [glitchGameOver, setGlitchGameOver] = useState(false);
  const [glitchHighScore, setGlitchHighScore] = useState(() => {
    return parseInt(localStorage.getItem('glitch-game-high-score') || '0');
  });
  const [glitchCombo, setGlitchCombo] = useState(0);

  // Snake Game State
  const [snake, setSnake] = useState<SnakeSegment[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Food>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const [snakeHighScore, setSnakeHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake-game-high-score') || '0');
  });

  // Memory Game State - FIXED LOGIC
  const [memoryPattern, setMemoryPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [showingPattern, setShowingPattern] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(-1);
  const [memoryGameOver, setMemoryGameOver] = useState(false);
  const [memoryHighScore, setMemoryHighScore] = useState(() => {
    return parseInt(localStorage.getItem('memory-game-high-score') || '0');
  });
  const [memoryFeedback, setMemoryFeedback] = useState<{type: 'correct' | 'wrong' | '', index: number}>({type: '', index: -1});

  // Reaction Game State
  const [reactionWaiting, setReactionWaiting] = useState(false);
  const [reactionReady, setReactionReady] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [reactionBestTime, setReactionBestTime] = useState(() => {
    return parseInt(localStorage.getItem('reaction-best-time') || '999999');
  });
  const [reactionRound, setReactionRound] = useState(0);
  const [reactionGameOver, setReactionGameOver] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionAverage, setReactionAverage] = useState(0);

  // Matrix Game State
  const [matrixChars, setMatrixChars] = useState<MatrixChar[]>([]);
  const [matrixScore, setMatrixScore] = useState(0);
  const [matrixGameOver, setMatrixGameOver] = useState(false);
  const [matrixHighScore, setMatrixHighScore] = useState(() => {
    return parseInt(localStorage.getItem('matrix-game-high-score') || '0');
  });
  const [matrixLevel, setMatrixLevel] = useState(1);
  const [matrixCombo, setMatrixCombo] = useState(0);

  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 300;
  const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

  // GSAP animations on mount
  useEffect(() => {
    const tl = gsap.timeline();
    gsap.set(".error-content > *", { opacity: 0, y: 30 });
    tl.to(".error-fuzzy", { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" })
    .to(".error-title", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
    .to(".error-buttons", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
    .to(".game-area", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");
    return () => { tl.kill(); };
  }, []);

  // Simple Snake Game Logic
  const generateFood = useCallback((): Food => {
    return {
      x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
    };
  }, []);

  const startSnakeGame = useCallback(() => {
    setCurrentGame('snake');
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setSnakeScore(0);
    setSnakeGameOver(false);
  }, []);

  // Enhanced Memory Game Logic - COMPLETELY FIXED
  const generateMemoryPattern = useCallback((level: number) => {
    const patternLength = Math.min(2 + level, 10);
    const pattern = [];
    for (let i = 0; i < patternLength; i++) {
      pattern.push(Math.floor(Math.random() * 9));
    }
    return pattern;
  }, []);

  const startMemoryGame = useCallback(() => {
    setCurrentGame('memory');
    setMemoryScore(0);
    setMemoryLevel(1);
    setMemoryGameOver(false);
    setPlayerPattern([]);
    setMemoryFeedback({type: '', index: -1});
    const pattern = generateMemoryPattern(1);
    setMemoryPattern(pattern);
    showMemoryPattern(pattern);
  }, [generateMemoryPattern]);

  const showMemoryPattern = (pattern: number[]) => {
    setShowingPattern(true);
    setCurrentPatternIndex(-1);
    
    pattern.forEach((cellIndex, patternIndex) => {
      setTimeout(() => {
        setCurrentPatternIndex(cellIndex);
        setTimeout(() => {
          setCurrentPatternIndex(-1);
          if (patternIndex === pattern.length - 1) {
            setTimeout(() => {
              setShowingPattern(false);
            }, 500);
          }
        }, 400);
      }, patternIndex * 600);
    });
  };

  const handleMemoryClick = (index: number) => {
    if (showingPattern || memoryGameOver) return;
    
    const newPlayerPattern = [...playerPattern, index];
    setPlayerPattern(newPlayerPattern);
    
    const currentStep = newPlayerPattern.length - 1;
    const isCorrect = newPlayerPattern[currentStep] === memoryPattern[currentStep];
    
    // Visual feedback
    setMemoryFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      index: index
    });
    
    setTimeout(() => {
      setMemoryFeedback({type: '', index: -1});
    }, 300);
    
    if (!isCorrect) {
      setTimeout(() => {
        setMemoryGameOver(true);
        if (memoryScore > memoryHighScore) {
          setMemoryHighScore(memoryScore);
          localStorage.setItem('memory-game-high-score', memoryScore.toString());
        }
      }, 300);
      return;
    }
    
    if (newPlayerPattern.length === memoryPattern.length) {
      const levelBonus = memoryLevel * 10;
      setMemoryScore(prev => prev + levelBonus);
      setMemoryLevel(prev => prev + 1);
      
      gsap.to(".memory-score", { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 });
      
      setTimeout(() => {
        setPlayerPattern([]);
        const nextPattern = generateMemoryPattern(memoryLevel + 1);
        setMemoryPattern(nextPattern);
        showMemoryPattern(nextPattern);
      }, 1000);
    }
  };

  // Enhanced Reaction Game Logic
  const startReactionGame = useCallback(() => {
    setCurrentGame('reaction');
    setReactionGameOver(false);
    setReactionRound(0);
    setReactionTime(0);
    setReactionTimes([]);
    setReactionAverage(0);
    startReactionRound();
  }, []);

  const startReactionRound = () => {
    setReactionWaiting(true);
    setReactionReady(false);
    setReactionRound(prev => prev + 1);
    
    const delay = Math.random() * 4000 + 2000; // 2-6 seconds
    setTimeout(() => {
      setReactionWaiting(false);
      setReactionReady(true);
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionWaiting) {
      setReactionGameOver(true);
      return;
    }
    
    if (reactionReady) {
      const time = Date.now() - reactionStartTime;
      setReactionTime(time);
      
      const newTimes = [...reactionTimes, time];
      setReactionTimes(newTimes);
      setReactionAverage(Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length));
      
      if (time < reactionBestTime) {
        setReactionBestTime(time);
        localStorage.setItem('reaction-best-time', time.toString());
        gsap.to(".reaction-best", { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1 });
      }
      
      if (reactionRound >= 5) {
        setTimeout(() => setReactionGameOver(true), 1500);
      } else {
        setTimeout(startReactionRound, 2000);
      }
      
      setReactionReady(false);
    }
  };

  // Enhanced Matrix Game Logic
  const startMatrixGame = useCallback(() => {
    setCurrentGame('matrix');
    setMatrixScore(0);
    setMatrixGameOver(false);
    setMatrixChars([]);
    setMatrixLevel(1);
    setMatrixCombo(0);
    if (matrixInputRef.current) {
      matrixInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (currentGame !== 'matrix' || matrixGameOver) return;

    const spawnRate = Math.max(800 - (matrixLevel * 50), 300);
    const interval = setInterval(() => {
      const newChar: MatrixChar = {
        id: Date.now() + Math.random(),
        char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
        x: Math.random() * 85 + 5,
        y: -5,
        speed: Math.random() * 1.5 + 0.5 + (matrixLevel * 0.2),
        color: Math.random() > 0.8 ? '#ff0080' : '#00ff41'
      };
      
      setMatrixChars(prev => [...prev, newChar]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [currentGame, matrixGameOver, matrixLevel]);

  useEffect(() => {
    if (currentGame !== 'matrix' || matrixGameOver) return;

    const moveInterval = setInterval(() => {
      setMatrixChars(prev => {
        const updatedChars = prev.map(char => ({
          ...char,
          y: char.y + char.speed
        })).filter(char => {
          if (char.y > 105) {
            setMatrixGameOver(true);
            if (matrixScore > matrixHighScore) {
              setMatrixHighScore(matrixScore);
              localStorage.setItem('matrix-game-high-score', matrixScore.toString());
            }
            return false;
          }
          return true;
        });
        
        return updatedChars;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [currentGame, matrixGameOver, matrixScore, matrixHighScore]);

  const handleMatrixKeyPress = (e: React.KeyboardEvent) => {
    const pressedKey = e.key.toUpperCase();
    
    const hitChar = matrixChars.find(char => 
      char.char === pressedKey && char.y > 15 && char.y < 85
    );
    
    if (hitChar) {
      setMatrixChars(prev => prev.filter(char => char.id !== hitChar.id));
      const points = hitChar.color === '#ff0080' ? 20 : 10;
      setMatrixScore(prev => prev + points * (1 + matrixCombo * 0.1));
      setMatrixCombo(prev => prev + 1);
      
      if (matrixCombo > 0 && matrixCombo % 10 === 0) {
        setMatrixLevel(prev => prev + 1);
        gsap.to(".matrix-level", { scale: 1.3, duration: 0.3, yoyo: true, repeat: 1 });
      }
      
      gsap.to(".matrix-score", { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
    } else {
      setMatrixCombo(0);
    }
    
    if (matrixInputRef.current) {
      matrixInputRef.current.value = '';
    }
  };

  // Classic Snake movement
  useEffect(() => {
    if (currentGame !== 'snake' || snakeGameOver) return;
    const gameLoop = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }
        
        if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || 
            head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE ||
            newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setSnakeGameOver(true);
          if (snakeScore > snakeHighScore) {
            setSnakeHighScore(snakeScore);
            localStorage.setItem('snake-game-high-score', snakeScore.toString());
          }
          return currentSnake;
        }
        
        newSnake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
          setSnakeScore(prev => prev + 10);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }
        
        return newSnake;
      });
    }, 150);
    return () => clearInterval(gameLoop);
  }, [currentGame, direction, food, snakeGameOver, snakeScore, snakeHighScore, generateFood]);

  // Simple keyboard controls for Snake
  useEffect(() => {
    if (currentGame !== 'snake') return;
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  // Enhanced Glitch Game Logic
  const startGlitchGame = useCallback(() => {
    setCurrentGame('glitch');
    setGlitchGameOver(false);
    setGlitchScore(0);
    setGlitchTimeLeft(30);
    setParticles([]);
    setGlitchCombo(0);
  }, []);

  useEffect(() => {
    if (currentGame !== 'glitch') return;
    const interval = setInterval(() => {
      const colors = ['#00ff41', '#ff0080', '#00ffff', '#ffff00', '#ff4500'];
      const newParticle: GlitchParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 75 + 12.5,
        y: Math.random() * 55 + 22.5,
        size: Math.random() * 15 + 8,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newParticle.id)), 2500);
    }, Math.max(600 - glitchCombo * 10, 200));
    return () => clearInterval(interval);
  }, [currentGame, glitchCombo]);

  useEffect(() => {
    if (currentGame !== 'glitch' || glitchTimeLeft <= 0) return;
    const timer = setTimeout(() => {
      if (glitchTimeLeft === 1) {
        setCurrentGame('none');
        setGlitchGameOver(true);
        if (glitchScore > glitchHighScore) {
          setGlitchHighScore(glitchScore);
          localStorage.setItem('glitch-game-high-score', glitchScore.toString());
        }
      } else {
        setGlitchTimeLeft(prev => prev - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentGame, glitchTimeLeft, glitchScore, glitchHighScore]);

  const handleParticleClick = (particleId: number) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
    const points = 10 + glitchCombo;
    setGlitchScore(prev => prev + points);
    setGlitchCombo(prev => prev + 1);
    gsap.to(".glitch-score", { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
  };

  const handleGoHome = () => navigate("/dashboard");
  const resetToMenu = () => {
    setCurrentGame('none');
    setSnakeGameOver(false);
    setGlitchGameOver(false);
    setMemoryGameOver(false);
    setReactionGameOver(false);
    setMatrixGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div className="error-content w-full max-w-5xl mx-auto text-center">
        
        {/* Main 404 Text */}
        <div className="error-fuzzy mb-4 flex justify-center">
          <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={0.8}
            enableHover={true}
            fontSize="clamp(2.5rem, 8vw, 5rem)"
            color="#ffffff"
            fontWeight={900}
          >
            404
          </FuzzyText>
        </div>

        {/* Title */}
        <div className="error-title mb-6 flex justify-center">
          <FuzzyText
            baseIntensity={0.15}
            hoverIntensity={0.5}
            enableHover={true}
            fontSize="clamp(0.9rem, 2.5vw, 1.3rem)"
            color="#94a3b8"
            fontWeight={600}
          >
            Neural Pathway Disrupted
          </FuzzyText>
        </div>

        {/* Game Area */}
        <div className="game-area mb-6">
          {currentGame === 'none' && !glitchGameOver && !snakeGameOver && !memoryGameOver && !reactionGameOver && !matrixGameOver && (
            <div className="text-center mb-6">
              <p className="text-slate-400 mb-4 text-sm">Initialize neural gaming protocols:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                <button onClick={startSnakeGame} className="p-4 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 group">
                  <div className="text-xl mb-1">🐍 Snake</div>
                  <div className="text-xs opacity-80">Classic snake game</div>
                  {snakeHighScore > 0 && <div className="text-xs text-green-200 font-mono mt-1">Record: {snakeHighScore}</div>}
                </button>
                <button onClick={startGlitchGame} className="p-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl mb-1">✨ Quantum Glitch</div>
                  <div className="text-xs opacity-80">Combo multipliers & color coding</div>
                  {glitchHighScore > 0 && <div className="text-xs text-purple-200 font-mono mt-1">Record: {glitchHighScore}</div>}
                </button>
                <button onClick={startMemoryGame} className="p-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl mb-1">🧠 Memory Matrix</div>
                  <div className="text-xs opacity-80">Sequential pattern training</div>
                  {memoryHighScore > 0 && <div className="text-xs text-blue-200 font-mono mt-1">Record: {memoryHighScore}</div>}
                </button>
                <button onClick={startReactionGame} className="p-4 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl mb-1">⚡ Synaptic Response</div>
                  <div className="text-xs opacity-80">Advanced timing & statistics</div>
                  {reactionBestTime < 999999 && <div className="text-xs text-orange-200 font-mono mt-1">Best: {reactionBestTime}ms</div>}
                </button>
                <button onClick={startMatrixGame} className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105">
                  <div className="text-xl mb-1">💻 Code Matrix</div>
                  <div className="text-xs opacity-80">Multi-level, combo system</div>
                  {matrixHighScore > 0 && <div className="text-xs text-emerald-200 font-mono mt-1">Record: {matrixHighScore}</div>}
                </button>
                <div className="p-4 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <div className="text-lg mb-1">🚀 Quantum AI</div>
                    <div className="text-xs">Next update...</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classic Snake Game */}
          {currentGame === 'snake' && !snakeGameOver && (
            <div className="text-center">
              <div className="snake-score text-green-400 font-mono mb-4">Score: {snakeScore}</div>
              <div className="relative mx-auto bg-slate-900/50 border-2 border-green-500/30 rounded-lg overflow-hidden" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                {snake.map((segment, index) => (
                  <div key={index} className={`absolute ${index === 0 ? 'bg-green-400' : 'bg-green-600'} rounded-sm`}
                    style={{ left: segment.x * GRID_SIZE, top: segment.y * GRID_SIZE, width: GRID_SIZE - 1, height: GRID_SIZE - 1 }} />
                ))}
                <div className="absolute bg-red-500 rounded-full"
                  style={{ left: food.x * GRID_SIZE + 2, top: food.y * GRID_SIZE + 2, width: GRID_SIZE - 4, height: GRID_SIZE - 4 }} />
              </div>
              <div className="mt-3 text-xs text-slate-400">Use WASD or Arrow Keys</div>
              <button onClick={resetToMenu} className="mt-2 px-4 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/30 transition-all duration-300">Quit</button>
            </div>
          )}

          {/* Enhanced Memory Game - FIXED */}
          {currentGame === 'memory' && !memoryGameOver && (
            <div className="text-center">
              <div className="mb-4 flex justify-center gap-6 text-sm">
                <div className="text-blue-400 font-mono">Neural Level: {memoryLevel}</div>
                <div className="memory-score text-green-400 font-mono">Patterns: {memoryScore / 10}</div>
                <div className="text-purple-400 font-mono">Sequence: {memoryPattern.length}</div>
              </div>
              {showingPattern && <div className="text-yellow-400 mb-3 text-sm animate-pulse font-mono">◤ ANALYZING PATTERN ◥</div>}
              {!showingPattern && <div className="text-cyan-400 mb-3 text-sm font-mono">◤ REPRODUCE SEQUENCE ◥</div>}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-4">
                {Array.from({ length: 9 }, (_, i) => (
                  <button key={i} onClick={() => handleMemoryClick(i)}
                    className={`w-16 h-16 rounded-lg font-bold text-sm transition-all duration-200 transform ${
                      currentPatternIndex === i ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50 animate-pulse' :
                      memoryFeedback.index === i ? 
                        (memoryFeedback.type === 'correct' ? 'bg-green-500 scale-105' : 'bg-red-500 scale-105') :
                      playerPattern.includes(i) ? 'bg-green-600/70 scale-105' : 
                      'bg-slate-700 hover:bg-slate-600 hover:scale-105'
                    }`} 
                    disabled={showingPattern}
                    style={{
                      boxShadow: currentPatternIndex === i ? '0 0 20px rgba(59, 130, 246, 0.8)' :
                                memoryFeedback.index === i && memoryFeedback.type === 'correct' ? '0 0 15px rgba(34, 197, 94, 0.8)' :
                                memoryFeedback.index === i && memoryFeedback.type === 'wrong' ? '0 0 15px rgba(239, 68, 68, 0.8)' : 'none'
                    }}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400 mb-2">Progress: {playerPattern.length}/{memoryPattern.length}</div>
              <button onClick={resetToMenu} className="px-4 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/30 transition-all duration-300">Terminate</button>
            </div>
          )}

          {/* Enhanced Reaction Game */}
          {currentGame === 'reaction' && !reactionGameOver && (
            <div className="text-center">
              <div className="mb-4 flex justify-center gap-4 text-sm">
                <div className="text-orange-400 font-mono">Round: {reactionRound}/5</div>
                {reactionTime > 0 && <div className="text-green-400 font-mono">Last: {reactionTime}ms</div>}
                {reactionAverage > 0 && <div className="text-blue-400 font-mono">Avg: {reactionAverage}ms</div>}
                {reactionBestTime < 999999 && <div className="reaction-best text-yellow-400 font-mono">Best: {reactionBestTime}ms</div>}
              </div>
              <div className={`w-96 h-64 mx-auto rounded-lg border-4 flex items-center justify-center cursor-pointer transition-all duration-200 transform ${
                reactionWaiting ? 'bg-red-600 border-red-400 shadow-lg shadow-red-500/50' :
                reactionReady ? 'bg-green-500 border-green-300 animate-pulse shadow-lg shadow-green-500/50 scale-105' :
                'bg-slate-700 border-slate-500 hover:scale-105'
              }`} onClick={handleReactionClick}>
                <div className="text-white text-xl font-bold text-center">
                  {reactionWaiting ? (
                    <div>
                      <div className="text-2xl mb-2">⏳ WAIT...</div>
                      <div className="text-sm opacity-80">Don't click yet!</div>
                    </div>
                  ) : reactionReady ? (
                    <div>
                      <div className="text-3xl mb-2 animate-bounce">⚡ CLICK NOW!</div>
                      <div className="text-sm opacity-80">React as fast as you can!</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl mb-2">🎯 GET READY</div>
                      <div className="text-sm opacity-80">Wait for green, then click!</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">Click when the screen turns green. Early clicks = game over!</div>
              <button onClick={resetToMenu} className="mt-2 px-4 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/30 transition-all duration-300">Terminate</button>
            </div>
          )}

          {/* Enhanced Matrix Game */}
          {currentGame === 'matrix' && !matrixGameOver && (
            <div className="text-center">
              <div className="mb-4 flex justify-center gap-4 text-sm">
                <div className="matrix-score text-emerald-400 font-mono">Score: {matrixScore}</div>
                <div className="matrix-level text-blue-400 font-mono">Level: {matrixLevel}</div>
                <div className="text-yellow-400 font-mono">Combo: {matrixCombo}</div>
              </div>
              <div className="relative w-96 h-64 mx-auto bg-black rounded-lg border-2 border-emerald-500/30 overflow-hidden shadow-lg shadow-emerald-500/20">
                {matrixChars.map(char => (
                  <div key={char.id} className="absolute font-mono font-bold animate-pulse select-none" 
                    style={{ 
                      left: `${char.x}%`, 
                      top: `${char.y}%`, 
                      fontSize: '18px',
                      color: char.color,
                      textShadow: `0 0 10px ${char.color}80`,
                      filter: char.color === '#ff0080' ? 'drop-shadow(0 0 5px #ff0080)' : 'drop-shadow(0 0 5px #00ff41)'
                    }}>
                    {char.char}
                  </div>
                ))}
                <div className="absolute bottom-2 left-2 text-emerald-400 text-xs font-mono opacity-60">
                  Pink = 2x Points
                </div>
              </div>
              <input ref={matrixInputRef} onKeyDown={handleMatrixKeyPress} 
                className="mt-3 w-24 h-10 bg-black border-2 border-emerald-500/50 rounded text-emerald-400 text-center font-mono text-lg focus:outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/30"
                placeholder="?" maxLength={1} autoComplete="off" />
              <div className="mt-2 text-xs text-slate-400">Type falling characters • Pink chars worth double points</div>
              <button onClick={resetToMenu} className="mt-2 px-4 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/30 transition-all duration-300">Terminate</button>
            </div>
          )}

          {/* Enhanced Glitch Game */}
          {currentGame === 'glitch' && !glitchGameOver && (
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-4 text-sm">
                <div className="glitch-score text-purple-400 font-mono">Score: {glitchScore}</div>
                <div className="text-orange-400 font-mono">Time: {glitchTimeLeft}s</div>
                <div className="text-green-400 font-mono">Combo: x{glitchCombo + 1}</div>
              </div>
              <div className="relative w-full max-w-md mx-auto h-52 bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden shadow-lg">
                {particles.map((particle) => (
                  <div key={particle.id} className="absolute cursor-pointer transition-all duration-100 hover:scale-125 animate-pulse"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: `${particle.size}px`, height: `${particle.size}px`, opacity: particle.opacity }}
                    onClick={() => handleParticleClick(particle.id)}>
                    <div className="w-full h-full rounded-full" style={{
                      background: `radial-gradient(circle, ${particle.color}ff, ${particle.color}80)`,
                      boxShadow: `0 0 15px ${particle.color}80, inset 0 0 10px ${particle.color}40`
                    }}></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-400">Click glowing particles • Higher combo = faster spawns & more points</div>
              <button onClick={resetToMenu} className="mt-2 px-4 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded border border-red-600/30 transition-all duration-300">Terminate</button>
            </div>
          )}

          {/* Enhanced Game Over Screens */}
          {(snakeGameOver || glitchGameOver || memoryGameOver || reactionGameOver || matrixGameOver) && (
            <div className="text-center mb-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 inline-block shadow-lg">
                <h3 className="text-xl font-bold text-white mb-3">
                  {snakeGameOver && '🐍 Snake Game Over'}
                  {glitchGameOver && '✨ Quantum Glitch Hunt Complete'}
                  {memoryGameOver && '🧠 Memory Matrix Training Failed'}
                  {reactionGameOver && (reactionRound > 1 ? '⚡ Synaptic Response Analysis Complete' : '⚡ Early Response Detected!')}
                  {matrixGameOver && '💻 Code Matrix Overwhelmed'}
                </h3>
                <div className="mb-4 space-y-2">
                  <p className="text-slate-300">
                    Final Score: <span className="font-mono text-2xl text-green-400">
                      {snakeGameOver && snakeScore}
                      {glitchGameOver && glitchScore}
                      {memoryGameOver && memoryScore}
                      {reactionGameOver && (reactionAverage > 0 ? `${reactionAverage}ms avg` : 'N/A')}
                      {matrixGameOver && matrixScore}
                    </span>
                  </p>
                  {reactionGameOver && reactionTimes.length > 0 && (
                    <div className="text-sm text-slate-400">
                      <p>Best: {Math.min(...reactionTimes)}ms | Worst: {Math.max(...reactionTimes)}ms</p>
                    </div>
                  )}
                  {(snakeScore > snakeHighScore || glitchScore > glitchHighScore || memoryScore > memoryHighScore || 
                    matrixScore > matrixHighScore || (reactionGameOver && reactionBestTime < 999999)) && (
                    <p className="text-yellow-400 text-lg animate-pulse">🏆 NEW RECORD ACHIEVED!</p>
                  )}
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => {
                    if (snakeGameOver) startSnakeGame();
                    else if (glitchGameOver) startGlitchGame();
                    else if (memoryGameOver) startMemoryGame();
                    else if (reactionGameOver) startReactionGame();
                    else if (matrixGameOver) startMatrixGame();
                  }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105">
                    Restart Protocol
                  </button>
                  <button onClick={resetToMenu} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105">
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Button */}
        <div className="error-buttons flex justify-center">
          <button onClick={handleGoHome} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/25">
            Return to Dashboard
          </button>
        </div>

        <div className="mt-4 text-slate-600 text-xs font-mono">
          Neural pathways disrupted. Gaming protocols active. {currentGame !== 'none' ? 'Training in progress...' : 'Awaiting input...'}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;