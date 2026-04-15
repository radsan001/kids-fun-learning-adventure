/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Circle, 
  Square, 
  Triangle, 
  Star, 
  Heart, 
  Volume2, 
  ArrowLeft, 
  Trophy,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
type GameType = 'MENU' | 'BALLOON_POP' | 'SHAPE_MATCH' | 'ANIMAL_SOUNDS';

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface Shape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  color: string;
  icon: React.ReactNode;
}

interface Animal {
  id: string;
  name: string;
  emoji: string;
  sound: string;
  color: string;
}

// --- Constants ---
const COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9B59B6', '#FF9F43'];

const ANIMALS: Animal[] = [
  { id: '1', name: 'Lion', emoji: '🦁', sound: 'ROAR!', color: '#FFD93D' },
  { id: '2', name: 'Elephant', emoji: '🐘', sound: 'PAWOO!', color: '#4D96FF' },
  { id: '3', name: 'Cow', emoji: '🐮', sound: 'MOOO!', color: '#6BCB77' },
  { id: '4', name: 'Dog', emoji: '🐶', sound: 'WOOF!', color: '#FF9F43' },
  { id: '5', name: 'Cat', emoji: '🐱', sound: 'MEOW!', color: '#FF6B6B' },
  { id: '6', name: 'Monkey', emoji: '🐵', sound: 'OO-OO-AA-AA!', color: '#9B59B6' },
];

const SHAPES: Shape[] = [
  { id: 's1', type: 'circle', color: '#FF6B6B', icon: <Circle size={48} fill="currentColor" /> },
  { id: 's2', type: 'square', color: '#4D96FF', icon: <Square size={48} fill="currentColor" /> },
  { id: 's3', type: 'triangle', color: '#6BCB77', icon: <Triangle size={48} fill="currentColor" /> },
  { id: 's4', type: 'star', color: '#FFD93D', icon: <Star size={48} fill="currentColor" /> },
  { id: 's5', type: 'heart', color: '#9B59B6', icon: <Heart size={48} fill="currentColor" /> },
];

// --- Mini Games ---

// 1. Balloon Pop Game
const BalloonPop = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnBalloon = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const newBalloon: Balloon = {
      id,
      x: Math.random() * (width - 100) + 50,
      y: height + 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 40 + 60,
    };
    setBalloons(prev => [...prev, newBalloon]);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawnBalloon, 800);
    return () => clearInterval(interval);
  }, [spawnBalloon]);

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
    if (score > 0 && score % 10 === 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-sky-100 rounded-3xl">
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-6 py-2 rounded-full font-bold text-2xl z-10 shadow-sm">
        Score: {score}
      </div>
      
      <AnimatePresence>
        {balloons.map(balloon => (
          <motion.div
            key={balloon.id}
            initial={{ y: '110vh', x: balloon.x }}
            animate={{ y: '-20vh' }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 6, ease: 'linear' }}
            onAnimationComplete={() => setBalloons(prev => prev.filter(b => b.id !== balloon.id))}
            onClick={() => popBalloon(balloon.id)}
            className="absolute cursor-pointer flex flex-col items-center"
            style={{ width: balloon.size, height: balloon.size * 1.2 }}
          >
            <div 
              className="w-full h-[85%] rounded-full shadow-inner relative"
              style={{ backgroundColor: balloon.color }}
            >
              <div className="absolute top-2 left-1/4 w-1/4 h-1/4 bg-white/30 rounded-full blur-[2px]" />
            </div>
            <div className="w-1 h-12 bg-gray-400/50" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// 2. Shape Match Game
const ShapeMatch = () => {
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [shuffledShapes, setShuffledShapes] = useState<Shape[]>([]);

  useEffect(() => {
    const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
    setShuffledShapes(shuffled);
    setCurrentShape(shuffled[0]);
  }, []);

  const handleMatch = (type: string) => {
    if (currentShape?.type === type) {
      setMatched(prev => [...prev, type]);
      confetti({
        particleCount: 30,
        spread: 50,
        colors: [currentShape.color]
      });
      
      const nextIndex = shuffledShapes.findIndex(s => s.id === currentShape.id) + 1;
      if (nextIndex < shuffledShapes.length) {
        setTimeout(() => setCurrentShape(shuffledShapes[nextIndex]), 500);
      } else {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
          });
          // Reset after a delay
          setTimeout(() => {
            const reshuffled = [...SHAPES].sort(() => Math.random() - 0.5);
            setShuffledShapes(reshuffled);
            setCurrentShape(reshuffled[0]);
            setMatched([]);
          }, 2000);
        }, 500);
      }
    }
  };

  return (
    <div className="w-full h-full bg-orange-50 rounded-3xl p-8 flex flex-col items-center justify-between">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Match the Shape!</h2>
        <p className="text-gray-500">Drag the shape to its shadow</p>
      </div>

      <div className="flex-1 flex items-center justify-center w-full gap-8">
        {/* Target Shadows */}
        <div className="grid grid-cols-3 gap-8">
          {SHAPES.map(shape => (
            <div 
              key={shape.id}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all ${
                matched.includes(shape.type) ? 'bg-green-100 text-green-500' : 'bg-gray-200 text-gray-400'
              }`}
              onMouseUp={() => handleMatch(shape.type)}
              onTouchEnd={() => handleMatch(shape.type)}
            >
              {shape.icon}
            </div>
          ))}
        </div>

        <div className="w-1 h-32 bg-gray-200 rounded-full" />

        {/* Current Draggable Shape */}
        <div className="w-48 h-48 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentShape && !matched.includes(currentShape.type) && (
              <motion.div
                key={currentShape.id}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 20 }}
                className="w-32 h-32 rounded-3xl shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ backgroundColor: currentShape.color, color: 'white' }}
              >
                {currentShape.icon}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// 3. Animal Sounds Game
const AnimalSounds = () => {
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null);

  const playSound = (animal: Animal) => {
    setActiveAnimal(animal.id);
    // In a real app, we'd play an audio file here.
    // For now, we use visual feedback.
    setTimeout(() => setActiveAnimal(null), 1500);
  };

  return (
    <div className="w-full h-full bg-green-50 rounded-3xl p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Animal Friends</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
        {ANIMALS.map(animal => (
          <motion.button
            key={animal.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSound(animal)}
            className="game-card relative flex flex-col items-center justify-center p-4 overflow-hidden"
          >
            <span className="text-7xl mb-2">{animal.emoji}</span>
            <span className="text-xl font-bold">{animal.name}</span>
            
            <AnimatePresence>
              {activeAnimal === animal.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute font-black text-2xl text-white drop-shadow-lg px-4 py-1 rounded-full"
                  style={{ backgroundColor: animal.color }}
                >
                  {animal.sound}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [game, setGame] = useState<GameType>('MENU');

  const renderGame = () => {
    switch (game) {
      case 'BALLOON_POP': return <BalloonPop />;
      case 'SHAPE_MATCH': return <ShapeMatch />;
      case 'ANIMAL_SOUNDS': return <AnimalSounds />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 md:p-8">
      <AnimatePresence mode="wait">
        {game === 'MENU' ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-4xl w-full text-center"
          >
            <div className="mb-12">
              <motion.div 
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="inline-block mb-4"
              >
                <Sparkles size={64} className="text-yellow-400" />
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-[#FF6B6B] drop-shadow-sm">
                KIDS FUN
              </h1>
              <p className="text-2xl text-gray-500 font-medium">Learning Adventure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <button 
                onClick={() => setGame('BALLOON_POP')}
                className="game-card p-8 flex flex-col items-center group"
              >
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-5xl">🎈</span>
                </div>
                <h3 className="text-2xl font-bold">Balloon Pop</h3>
                <p className="text-gray-400 text-sm mt-2">Tap to pop!</p>
              </button>

              <button 
                onClick={() => setGame('SHAPE_MATCH')}
                className="game-card p-8 flex flex-col items-center group"
              >
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star size={48} className="text-blue-500" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold">Shape Match</h3>
                <p className="text-gray-400 text-sm mt-2">Find the shadow!</p>
              </button>

              <button 
                onClick={() => setGame('ANIMAL_SOUNDS')}
                className="game-card p-8 flex flex-col items-center group"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Volume2 size={48} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">Animal Friends</h3>
                <p className="text-gray-400 text-sm mt-2">Listen & Learn!</p>
              </button>
            </div>

            <div className="mt-12 flex justify-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-bounce" />
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 rounded-full bg-green-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full h-full max-w-6xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 px-4">
              <button 
                onClick={() => setGame('MENU')}
                className="flex items-center gap-2 font-bold text-xl text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft /> Back to Menu
              </button>
              
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Gamepad2 className="text-[#FF6B6B]" />
                <span className="font-bold text-lg">
                  {game.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {renderGame()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorations */}
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10" />
    </div>
  );
}
