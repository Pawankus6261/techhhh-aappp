'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Team } from '@/types';
import Button from '@/components/Button';

export default function CompletePage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [elapsedFormat, setElapsedFormat] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('tech_escape_team');
    if (!saved) return router.push('/');

    const t = JSON.parse(saved) as Team;
    setTeam(t);

    const endTime = t.endTime || Date.now();
    const elapsedSecs = Math.floor((endTime - t.startTime) / 1000);
    const m = Math.floor(elapsedSecs / 60);
    const s = elapsedSecs % 60;
    setElapsedFormat(`${m} MINS ${s} SECS`);
  }, [router]);

  const handleReturn = () => {
    localStorage.removeItem('tech_escape_team');
    router.push('/');
  };

  if (!team) return null;

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-[#001205] relative overflow-hidden p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none" />
      
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[150px] -z-10" 
      />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="z-10 flex flex-col items-center text-center max-w-2xl w-full"
      >
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1, rotate: 360 }}
           transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <ShieldCheck size={100} className="mb-8 text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-glow-emerald text-white">
          SYSTEM <span className="text-emerald-500">SECURED</span>
        </h1>
        
        <div className="w-full bg-[#021008] border border-emerald-500/40 p-10 rounded-2xl mb-12 shadow-[0_0_40px_rgba(16,185,129,0.2)] glow-border">
          <p className="text-emerald-300/60 font-bold tracking-[0.3em] uppercase text-xs mb-2">Verified Squad</p>
          <p className="text-3xl text-emerald-400 font-mono font-bold mb-8 uppercase tracking-widest">{team.name}</p>
          
          <div className="flex flex-col items-center pb-6 border-b border-emerald-900">
            <p className="text-emerald-300/60 font-bold tracking-[0.3em] uppercase text-xs mb-2">Decryption Time</p>
            <p className="text-4xl text-white font-mono font-black animate-pulse">{elapsedFormat}</p>
          </div>
          
          <p className="text-sm text-emerald-600/80 font-mono uppercase mt-6 tracking-widest">
            {'>'} Access Granted. All hostile connections terminated.
          </p>
        </div>

        <Button variant="success" onClick={handleReturn} className="px-12 w-full md:w-auto">
          RETURN TO HOMEPAGE
        </Button>
      </motion.div>
    </main>
  );
}