'use client';
import { useEffect, useState } from 'react';
import { Database, Trash2, RefreshCw, Trophy, Activity, Terminal, Ban, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { cn } from '@/utils/cn';

export default function AdminDashboard() {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [history, setHistory] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  const checkAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'krishna_12';
    if (adminUser === validUser && adminPass === validPass) {
      setIsAdmin(true);
      sessionStorage.setItem('tech_escape_admin', 'true');
      setAuthError('');
    } else {
      setAuthError('INVALID CREDENTIALS — ACCESS DENIED');
    }
  };

  const loadData = () => {
    setLoading(true);
    const active = localStorage.getItem('tech_escape_team');
    setActiveTeam(active ? JSON.parse(active) : null);

    const logs = localStorage.getItem('tech_escape_logs');
    if (logs) {
      const parsedLogs: Team[] = JSON.parse(logs);
      
      // Calculate duration and sort
      parsedLogs.sort((a, b) => {
        // Sort by Level Descending
        if (b.level !== a.level) return b.level - a.level;
        
        // Sort by Fastest Time Ascending if levels are equal
        const timeA = (a.endTime || Date.now()) - a.startTime;
        const timeB = (b.endTime || Date.now()) - b.startTime;
        return timeA - timeB;
      });
      setHistory(parsedLogs);
    } else {
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem('tech_escape_admin') === 'true') setIsAdmin(true);
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWipe = () => {
    if (window.confirm('WARNING: THIS WILL WIPE ALL LOCAL STORAGE HISTORY & CURRENT TEAMS! PROCEED?')) {
      localStorage.removeItem('tech_escape_team');
      localStorage.removeItem('tech_escape_logs');
      loadData();
    }
  };

  const getDuration = (t: Team) => {
    const end = t.endTime || Date.now();
    const d = Math.floor((end - t.startTime) / 1000);
    const m = Math.floor(d / 60);
    const s = d % 60;
    return `${m}m ${s}s`;
  };

  const disqualifyTeam = (code: string) => {
    if (!window.confirm(`Disqualify squad with code ${code}?`)) return;
    
    const logs = localStorage.getItem('tech_escape_logs');
    if (logs) {
      let parsedLogs: Team[] = JSON.parse(logs);
      parsedLogs = parsedLogs.map(t => t.code === code ? { ...t, status: 'disqualified', endTime: Date.now() } : t);
      localStorage.setItem('tech_escape_logs', JSON.stringify(parsedLogs));
    }
    
    if (activeTeam && activeTeam.code === code) {
       const updated = { ...activeTeam, status: 'disqualified' as const, endTime: Date.now() };
       localStorage.setItem('tech_escape_team', JSON.stringify(updated));
       setActiveTeam(updated);
    }
    loadData();
  };

  const reviveTeam = (code: string) => {
    if (!window.confirm(`Revive squad with code ${code}?`)) return;
    
    const logs = localStorage.getItem('tech_escape_logs');
    if (logs) {
      let parsedLogs: Team[] = JSON.parse(logs);
      parsedLogs = parsedLogs.map(t => t.code === code ? { ...t, status: 'active', endTime: undefined } : t);
      localStorage.setItem('tech_escape_logs', JSON.stringify(parsedLogs));
    }
    
    if (activeTeam && activeTeam.code === code) {
       const updated = { ...activeTeam, status: 'active' as const, endTime: undefined };
       localStorage.setItem('tech_escape_team', JSON.stringify(updated));
       setActiveTeam(updated);
    }
    loadData();
  };

  const deleteTeam = (code: string) => {
    if (!window.confirm(`Permanently delete squad ${code}?`)) return;
    
    const logs = localStorage.getItem('tech_escape_logs');
    if (logs) {
      let parsedLogs: Team[] = JSON.parse(logs);
      parsedLogs = parsedLogs.filter(t => t.code !== code);
      localStorage.setItem('tech_escape_logs', JSON.stringify(parsedLogs));
    }
    
    if (activeTeam && activeTeam.code === code) {
       localStorage.removeItem('tech_escape_team');
       setActiveTeam(null);
    }
    loadData();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#02050f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#040d21] p-8 rounded-xl border border-cyan-500/30 shadow-2xl max-w-md w-full"
        >
          <div className="flex flex-col items-center mb-8">
            <Database className="text-cyan-500 mb-4" size={48} />
            <h1 className="text-2xl font-black font-mono tracking-widest text-white">OVERSEER_LOGIN</h1>
            <p className="text-cyan-600 text-[10px] mt-2 tracking-[0.3em] uppercase">Security Clearance Required</p>
          </div>
          <form onSubmit={checkAdmin} className="space-y-4">
            <Input
              type="text"
              placeholder="USERNAME"
              value={adminUser}
              onChange={(e) => { setAdminUser(e.target.value); setAuthError(''); }}
              autoComplete="off"
            />
            <Input
              type="password"
              placeholder="PASSWORD"
              value={adminPass}
              onChange={(e) => { setAdminPass(e.target.value); setAuthError(''); }}
            />
            {authError && (
              <p className="text-red-500 text-[10px] font-mono uppercase tracking-widest text-center bg-red-950/30 border border-red-900/50 p-2 rounded">
                !! {authError} !!
              </p>
            )}
            <Button type="submit" className="w-full h-14">
              AUTHENTICATE_SESSION
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full min-h-screen relative">
      <div className="w-full flex justify-between items-center mb-10 pb-6 border-b border-cyan-800">
        <h1 className="text-2xl md:text-4xl font-black font-mono tracking-[0.2em] text-white flex items-center gap-4">
          <Database className="text-cyan-500" size={32} />
          OVERSEER_PROTOCOL
        </h1>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={loadData} className="px-4 py-2 border border-cyan-900/50">
            <RefreshCw size={16} /> REFRESH
          </Button>
          <Button variant="danger" onClick={handleWipe} className="px-4 py-2 text-sm">
            <Trash2 size={16} /> WIPE DB
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEADERBOARD PANEL */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-cyan-400 font-bold tracking-widest uppercase border-b border-cyan-900/50 pb-2">
            <Trophy /> Global Leaderboard
          </div>
          
          <div className="bg-[#040d21] rounded-xl border border-cyan-800/50 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="grid grid-cols-12 gap-4 bg-cyan-950/40 p-4 border-b border-cyan-800/50 text-cyan-600 font-mono text-xs uppercase tracking-widest font-bold">
               <div className="col-span-1 text-center">Rnk</div>
               <div className="col-span-4">Squad Name</div>
               <div className="col-span-2 text-center">Code</div>
               <div className="col-span-1 text-center">Lvl</div>
               <div className="col-span-2 text-right">Time</div>
               <div className="col-span-2 text-right">Action</div>
            </div>
            
            <div className="flex flex-col min-h-[300px]">
              {loading ? (
                 <div className="p-10 flex justify-center"><Terminal className="animate-spin-slow text-cyan-500" /></div>
              ) : history.length === 0 ? (
                 <div className="p-10 text-center text-cyan-800 font-mono uppercase tracking-widest">No squad records found.</div>
              ) : (
                history.map((team, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={`${team.name}-${team.code}-${idx}`}
                    className={cn(
                      "grid grid-cols-12 gap-4 p-4 border-b border-cyan-900/30 items-center font-mono text-sm transition-colors",
                      idx === 0 ? "bg-emerald-950/20" : "hover:bg-cyan-950/20",
                      team.status === 'disqualified' && 'opacity-50 grayscale'
                    )}
                  >
                    <div className={cn("col-span-1 text-center font-black", idx === 0 ? "text-emerald-400 text-lg" : "text-cyan-600")}>
                      #{idx + 1}
                    </div>
                    <div className="col-span-4 font-bold text-white tracking-widest truncate">{team.name}</div>
                    <div className="col-span-2 text-cyan-700 text-center tracking-[0.2em]">{team.code}</div>
                    <div className={cn("col-span-1 text-center font-black", team.status === 'completed' ? 'text-emerald-400' : 'text-cyan-400')}>
                      {team.level}
                    </div>
                    <div className="col-span-2 text-right text-cyan-300">{getDuration(team)}</div>
                    <div className="col-span-2 flex justify-end gap-2">
                       {team.status === 'disqualified' ? (
                         <button onClick={() => reviveTeam(team.code)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/20 rounded transition-colors" title="Revive">
                            <RefreshCcw size={16} />
                         </button>
                       ) : (
                         <button onClick={() => disqualifyTeam(team.code)} className="p-1.5 text-orange-500 hover:bg-orange-500/20 rounded transition-colors" title="Disqualify">
                            <Ban size={16} />
                         </button>
                       )}
                       <button onClick={() => deleteTeam(team.code)} className="p-1.5 text-red-500 hover:bg-red-500/20 rounded transition-colors" title="Delete record">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE SESSION PANEL */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-emerald-400 font-bold tracking-widest uppercase border-b border-emerald-900/50 pb-2">
            <Activity className="animate-pulse" /> Live Target Matrix
          </div>
          
          <div className="bg-[#02050f] rounded-xl border border-emerald-900/50 p-6 relative overflow-hidden h-full min-h-[300px]">
             {/* Scanner line effect inside the box */}
             <div className="absolute inset-0 border-t-2 border-emerald-500/20 translate-y-[-100%] animate-[scanline_3s_linear_infinite]" />
             
             {activeTeam ? (
               <div className="flex flex-col gap-6 h-full font-mono relative z-10">
                 <div>
                   <p className="text-emerald-800 text-[10px] uppercase font-bold tracking-[0.3em] mb-1">Squad ID</p>
                   <p className="text-white text-2xl truncate uppercase tracking-widest">{activeTeam.name}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#040d21] border border-emerald-900/40 p-4 rounded-lg">
                     <p className="text-emerald-800 text-[10px] uppercase tracking-[0.2em] mb-1">Status</p>
                     <p className={cn("font-bold uppercase tracking-widest", 
                       activeTeam.status === 'active' ? "text-emerald-400 animate-pulse" : 
                       activeTeam.status === 'disqualified' ? "text-red-500" : "text-emerald-300"
                     )}>
                       [{activeTeam.status}]
                     </p>
                   </div>
                   <div className="bg-[#040d21] border border-emerald-900/40 p-4 rounded-lg">
                     <p className="text-emerald-800 text-[10px] uppercase tracking-[0.2em] mb-1">Current Node</p>
                     <p className="text-white font-bold text-xl">{activeTeam.level}</p>
                   </div>
                 </div>
                 
                 <div className="mt-auto">
                    <Button 
                      variant="danger" 
                      className="w-full"
                      onClick={() => activeTeam && disqualifyTeam(activeTeam.code)}
                      disabled={activeTeam.status === 'disqualified'}
                    >
                      TERMINATE_SESSION
                    </Button>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-emerald-900 font-mono gap-4 opacity-40">
                  <Terminal size={48} />
                  <p className="text-[10px] tracking-[0.5em] uppercase font-black">NO_ACTIVE_UPLINK</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </main>
  );
}
