'use client';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Team } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [squadName, setSquadName] = useState('');
  const [squadCode, setSquadCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto redirect if already logged in and active
  useEffect(() => {
    const saved = localStorage.getItem('tech_escape_team');
    if (saved) {
      const team = JSON.parse(saved) as Team;
      if (team.status === 'active') router.push('/game');
      else if (team.status === 'completed') router.push('/complete');
      else if (team.status === 'disqualified') router.push('/disqaulify');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!squadName.trim() || !squadCode.trim()) {
      setError('ALL FIELDS ARE REQUIRED FOR CLEARANCE');
      return;
    }
    
    if (squadName.length < 3) {
      setError('SQUAD NAME MUST BE AT LEAST 3 CHARS');
      return;
    }

    if (squadCode.length < 4) {
      setError('ACCESS CODE MUST BE AT LEAST 4 CHARS');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/data/teams.json');
      const teams = await response.json();
      
      const foundTeam = teams.find((t: any) => 
        t.name.toLowerCase() === squadName.trim().toLowerCase() && 
        t.team_code === squadCode.trim().toUpperCase()
      );

      if (!foundTeam) {
        setError('INVALID CREDENTIALS OR SQUAD NOT FOUND');
        setIsLoading(false);
        return;
      }

      const newTeam: Team = {
        name: foundTeam.name,
        code: foundTeam.team_code,
        level: 1,
        startTime: Date.now(),
        status: 'active',
      };

      // Set Active Session
      localStorage.setItem('tech_escape_team', JSON.stringify(newTeam));
      
      // ✅ Sync to KV Live Server
      fetch('/api/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      }).catch(e => console.error('Failed to sync team login', e));
      
      // Add to Global Logs
      const historyItem = localStorage.getItem('tech_escape_logs');
      const historyList: Team[] = historyItem ? JSON.parse(historyItem) : [];
      
      // Remove if team exists already to restart their specific logs, or just push
      const filteredHistory = historyList.filter(t => t.name.toLowerCase() !== newTeam.name.toLowerCase() || t.code !== newTeam.code);
      filteredHistory.push(newTeam);
      localStorage.setItem('tech_escape_logs', JSON.stringify(filteredHistory));

      setTimeout(() => {
        router.push('/game');
      }, 1000); // Artificial delay for hacky aesthetic
    } catch (err) {
      console.error(err);
      setError('SYSTEM ERROR: UNABLE TO CONTACT MAINFRAME DB');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 min-h-screen relative overflow-hidden bg-[#02050f]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwNmI2ZDQiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-1 md:p-1 border border-cyan-500/30 bg-gradient-to-b from-cyan-500/20 to-transparent shadow-[0_0_40px_rgba(6,182,212,0.1)] rounded-2xl glow-border relative"
      >
        <div className="w-full bg-[#040d21] p-8 md:p-12 rounded-xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-10 border-b border-cyan-900/50 pb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Fingerprint size={60} className="text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            </motion.div>
            <h2 className="text-3xl font-black tracking-[0.2em] text-white uppercase text-glow">Verification</h2>
            <p className="text-cyan-600/80 text-sm mt-3 font-mono tracking-widest">[ AUTH_REQUIRED ]</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="squadName" className="block text-xs font-bold text-cyan-600 uppercase tracking-[0.2em]">
                Squad Designation
              </label>
              <Input
                id="squadName"
                type="text"
                placeholder="Name"
                value={squadName}
                onChange={(e) => {
                  setSquadName(e.target.value);
                  setError('');
                }}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="squadCode" className="block text-xs font-bold text-cyan-600 uppercase tracking-[0.2em]">
                Access Code (Create Password)
              </label>
              <Input
                id="squadCode"
                type="password"
                placeholder="****"
                value={squadCode}
                onChange={(e) => {
                  setSquadCode(e.target.value);
                  setError('');
                }}
                maxLength={8}
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs mt-2 font-mono uppercase bg-red-950/30 p-3 rounded border border-red-900/50 text-center animate-flicker"
              >
                !! {error} !!
              </motion.p>
            )}

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? '[ CONNECTING TO MAINFRAME... ]' : 'TRANSMIT_CREDENTIALS'}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}