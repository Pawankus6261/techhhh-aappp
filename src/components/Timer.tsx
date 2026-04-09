'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Timer({ startTime }: { startTime?: number }) {
  const [timeLeft, setTimeLeft] = useState('60:00');
  const [isLowTime, setIsLowTime] = useState(false);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const distance = (startTime + 60 * 60 * 1000) - Date.now(); // 60 mins
      if (distance <= 0) {
        clearInterval(interval); 
        setTimeLeft('00:00'); 
        setIsLowTime(true);
        return;
      }
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (m < 5) setIsLowTime(true);
      
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 font-bold border px-5 py-3 rounded-lg shadow-inner font-mono tracking-widest text-lg transition-colors",
        isLowTime 
          ? "text-red-500 border-red-500/50 bg-red-900/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-flicker" 
          : "text-cyan-400 border-cyan-800 bg-cyan-950/20"
      )}
    >
      <Clock size={20} className={cn(isLowTime && "animate-pulse")} /> 
      {timeLeft}
    </motion.div>
  );
}