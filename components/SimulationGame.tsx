import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CinematicButton } from './CinematicButton';
import { AlertTriangle, Zap, CheckCircle } from 'lucide-react';

interface SimulationGameProps {
  onComplete: (score: number) => void;
}

export const SimulationGame: React.FC<SimulationGameProps> = ({ onComplete }) => {
  // Game Logic: Keep "pressure" between 40 and 60.
  // Pressure naturally fluctuates violently.
  const [pressure, setPressure] = useState(50);
  const [stability, setStability] = useState(100); // Health
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds intensive
  const [isActive, setIsActive] = useState(false);
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'finished'>('ready');
  
  const requestRef = useRef<number>();
  const scoreAccumulator = useRef<number>(0);
  const totalTicks = useRef<number>(0);

  const startGame = () => {
    setIsActive(true);
    setGameStatus('playing');
  };

  const updateGame = useCallback(() => {
    if (!isActive) return;

    // Add random noise/jitter
    const noise = (Math.random() - 0.5) * 1.5;
    
    setPressure(prev => {
      let newPressure = prev + noise;
      // Natural drift towards chaos
      if (Math.random() > 0.5) {
        newPressure += (Math.random() > 0.5 ? 0.2 : -0.2);
      }
      return Math.max(0, Math.min(100, newPressure));
    });

    // Check zones
    const inZone = pressure >= 40 && pressure <= 60;
    
    // Integrity damage if out of zone
    if (!inZone) {
      setStability(prev => Math.max(0, prev - 0.3));
    } else {
        // Heal slightly if in zone
        setStability(prev => Math.min(100, prev + 0.05));
    }

    // Scoring
    totalTicks.current += 1;
    if (inZone) {
      scoreAccumulator.current += 1;
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isActive, pressure]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isActive, updateGame]);

  // Timer
  useEffect(() => {
    // Fixed: Use ReturnType<typeof setInterval> to avoid reliance on NodeJS namespace
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0 && stability > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && (timeLeft === 0 || stability === 0)) {
      setIsActive(false);
      setGameStatus('finished');
      const finalScore = Math.floor((scoreAccumulator.current / totalTicks.current) * 100) || 0;
      // Slight delay before moving on so user sees result
      setTimeout(() => onComplete(finalScore), 2000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, stability, onComplete]);

  const handleManualAdjust = (amount: number) => {
    if (!isActive) return;
    setPressure(prev => Math.max(0, Math.min(100, prev + amount)));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black/50 border border-aether-500/30 rounded-xl backdrop-blur-md relative overflow-hidden">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="text-left">
          <div className="text-xs text-aether-accent uppercase tracking-widest">System Integrity</div>
          <div className={`text-2xl font-display font-bold ${stability < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {Math.floor(stability)}%
          </div>
        </div>
        
        <div className="text-center">
            {gameStatus === 'ready' && <div className="text-yellow-400 font-bold animate-pulse">INITIATING PROTOCOL</div>}
            {gameStatus === 'playing' && <div className="text-red-500 font-bold animate-pulse">CRITICAL FLUX DETECTED</div>}
            {gameStatus === 'finished' && <div className="text-green-500 font-bold">SEQUENCE COMPLETE</div>}
        </div>

        <div className="text-right">
          <div className="text-xs text-aether-accent uppercase tracking-widest">Time Remaining</div>
          <div className="text-2xl font-display font-bold text-white">{timeLeft}s</div>
        </div>
      </div>

      {/* Main Meter */}
      <div className="relative h-24 bg-gray-900 rounded-lg mb-8 overflow-hidden border-2 border-gray-700">
        {/* The Safe Zone */}
        <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-green-900/30 border-x-2 border-green-500/50 flex items-center justify-center">
          <span className="text-green-500/50 text-xs font-bold uppercase">Optimal</span>
        </div>
        
        {/* The Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-75 ease-linear z-10"
          style={{ left: `${pressure}%` }}
        />

        {/* Warning Strips */}
        {pressure < 20 || pressure > 80 ? (
           <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"></div> 
        ) : null}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-8">
        <CinematicButton 
          onClick={() => handleManualAdjust(-15)} 
          className="w-full"
          variant="danger"
          disabled={gameStatus !== 'playing'}
        >
          <div className="flex flex-col items-center">
             <AlertTriangle className="w-6 h-6 mb-1" />
             <span>Vent Pressure</span>
          </div>
        </CinematicButton>
        
        <CinematicButton 
          onClick={() => handleManualAdjust(15)} 
          className="w-full"
          variant="primary"
          disabled={gameStatus !== 'playing'}
        >
          <div className="flex flex-col items-center">
             <Zap className="w-6 h-6 mb-1" />
             <span>Inject Coolant</span>
          </div>
        </CinematicButton>
      </div>

      {/* Intro Overlay */}
      {gameStatus === 'ready' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold mb-4 text-white">Manual Stabilization Required</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              The AI core is fluctuating. Use controls to keep the white marker within the central green zone.
            </p>
            <CinematicButton onClick={startGame}>Engage Systems</CinematicButton>
          </div>
        </div>
      )}
    </div>
  );
};