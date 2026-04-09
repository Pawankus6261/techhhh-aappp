'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Team, Task } from '@/types';
import { fetchTasks, fetchTeams } from '@/utils/dataFetcher';
import { cn } from '@/utils/cn';
import Timer from '@/components/Timer';
import { Modal } from '@/components/Modal';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function GamePage() {
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [validBalloonTokens, setValidBalloonTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // stores "A" | "B" | "C" | "D"
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ JSON string "[\"A: URL\", \"B: API\"]" → ["A: URL", "B: API"]
  const getOptions = (task: Task | null): string[] => {
    if (!task?.options) return [];
    if (Array.isArray(task.options)) return task.options;
    if (typeof task.options === 'string') {
      try {
        const parsed = JSON.parse(task.options);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback: comma split
        return task.options.split(',').map(o => o.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const isMCQ = (task: Task | null): boolean => getOptions(task).length > 0;

  // ✅ Option index se letter nikalo: 0→"A", 1→"B", 2→"C", 3→"D"
  const getOptionLetter = (index: number): string =>
    String.fromCharCode(65 + index);

  const initializeGame = useCallback(async () => {
    const saved = localStorage.getItem('tech_escape_team');
    if (!saved) return router.push('/login');
    const sessionData = JSON.parse(saved) as Team;

    try {
      const allTeams = await fetchTeams();
      const teamDetails = allTeams.find(
        t => t.name.toLowerCase() === sessionData.name.toLowerCase()
      );
      if (!teamDetails) return router.push('/login');

      // Balloon tokens for level 7
      const qrResponse = await fetch('/data/hunt_qrcodes_rows.json');
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        const realTokens = qrData
          // ✅ Team-specific token filter based on team_id
          .filter((item: any) => item.type === 'balloon_real' && item.team_id === teamDetails.id)
          .map((item: any) => item.token.toLowerCase());
        setValidBalloonTokens(realTokens);
      }

      const allQuestions = await fetchTasks();
      const diffMap: Record<string, string> = {
        '1st': 'easy', '2nd': 'medium', '3rd': 'hard', mix: 'hard',
      };
      const targetDifficulty = diffMap[teamDetails.year || ''] || 'easy';

      const finalTaskSet: Task[] = [];

      // ✅ Level 3 skip — 1,2,4,5,6,7,8
      const levelsToUse = [1, 2, 4, 5, 6, 7, 8];

      for (const lvl of levelsToUse) {
        const levelPool = allQuestions.filter(
          q => q.level === lvl && q.difficulty === targetDifficulty
        );
        if (levelPool.length > 0) {
          const randomQ = levelPool[Math.floor(Math.random() * levelPool.length)];
          finalTaskSet.push(randomQ);
        }
      }

      setTasks(finalTaskSet);
      setTeam({ ...sessionData, year: teamDetails.year });
    } catch (err) {
      console.error('Initialization Error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { initializeGame(); }, [initializeGame]);

  // ✅ Live Polling for Admin Actions
  useEffect(() => {
    if (!team) return;
    const checkLiveStatus = async () => {
      try {
        const res = await fetch(`/api/status?code=${team.code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'disqualified' && team.status !== 'disqualified') {
             const updated = { ...team, status: 'disqualified' as const, endTime: Date.now() };
             setTeam(updated);
             localStorage.setItem('tech_escape_team', JSON.stringify(updated));
             router.push('/disqaulify');
          }
        }
      } catch (err) {
        // Silently ignore network polling errors
      }
    };
    const interval = setInterval(checkLiveStatus, 5000);
    return () => clearInterval(interval);
  }, [team, router]);

  const handleOpenModal = (task: Task) => {
    setActiveTask(task);
    setAnswerInput('');
    setSelectedOption(null);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTask || !team) return;

    let isCorrect = false;

    if (activeTask.level === 7) {
      // Balloon QR token check
      const userInput = answerInput.trim().toLowerCase();
      isCorrect = validBalloonTokens.includes(userInput);

    } else if (isMCQ(activeTask)) {
      // ✅ MCQ: selectedOption is "A"/"B"/"C"/"D"
      // answer field in JSON is also "A"/"B"/"C"/"D"
      if (!selectedOption) return;
      isCorrect = selectedOption === activeTask.answer.trim().toUpperCase();

    } else {
      // Text answer — case insensitive
      const userInput = answerInput.trim().toLowerCase();
      isCorrect = userInput === activeTask.answer.toLowerCase();
    }

    if (isCorrect) {
      const isFinal = team.level === tasks.length;
      const updated: Team = {
        ...team,
        level: isFinal ? team.level : team.level + 1,
        status: isFinal ? 'completed' : 'active',
      };
      setTeam(updated);
      localStorage.setItem('tech_escape_team', JSON.stringify(updated));
      
      // ✅ Sync to KV Live Server
      fetch('/api/team/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(e => console.error('Failed to sync team progress', e));
      
      setModalOpen(false);
      setAnswerInput('');
      setSelectedOption(null);
      if (isFinal) setTimeout(() => router.push('/complete'), 1000);
    } else {
      setErrorMsg('💀 ACCESS_DENIED: INVALID PAYLOAD');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  if (loading || !team || tasks.length === 0)
    return (
      <div className="flex-1 flex justify-center items-center bg-[#02050f] font-mono text-cyan-500 tracking-widest animate-pulse">
        [ SYNCING_GATEWAY_PROTOCOLS... ]
      </div>
    );

  return (
    <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full min-h-screen font-mono uppercase">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-cyan-900/50 gap-6"
      >
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest">
            SQUAD <span className="text-cyan-400">{team.name}</span>
          </h1>
          <p className="text-[10px] text-cyan-600 mt-2 tracking-[0.4em]">
            YEAR: {team.year}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Timer startTime={team.startTime} />
          <div className="text-right border-l border-cyan-900/50 pl-6">
            <p className="text-2xl font-black text-white">
              {team.level}{' '}
              <span className="text-cyan-800">/ {tasks.length}</span>
            </p>
            <p className="text-[10px] text-cyan-600">NODES_CLEARED</p>
          </div>
        </div>
      </motion.header>

      {/* ── Task Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tasks.map((task, idx) => {
          const isCompleted = idx + 1 < team.level;
          const isActive = idx + 1 === team.level;
          return (
            <motion.div
              key={task.id}
              whileHover={isActive ? { scale: 1.02 } : {}}
              onClick={() => { if (isActive) handleOpenModal(task); }}
              className={cn(
                'relative p-6 border rounded-xl transition-all h-44 flex flex-col justify-between overflow-hidden',
                isActive
                  ? 'border-cyan-400 bg-cyan-950/20 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-emerald-950/10 opacity-70'
                  : 'border-gray-900 bg-black/40 opacity-30 grayscale cursor-not-allowed'
              )}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-cyan-700">
                  NODE_{String(idx + 1).padStart(2, '0')}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="text-emerald-500" />
                ) : isActive ? (
                  <Unlock className="text-cyan-400 animate-pulse" />
                ) : (
                  <Lock className="text-gray-700" />
                )}
              </div>
              <h3 className={cn('font-bold text-lg', isActive ? 'text-white' : 'text-gray-600')}>
                {task.category || 'System Node'}
              </h3>
              <div className="text-[10px] tracking-widest font-black uppercase">
                {isCompleted ? 'RESOLVED' : isActive ? 'OPEN_ACCESS' : 'ENCRYPTED'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`DECRYPT_NODE_0${team.level}`}
      >
        {/* Question */}
        <div className="mb-6">
          <p className="text-cyan-600 text-[10px] tracking-widest font-black mb-4 opacity-60">
            CATEGORY: {activeTask?.category}
          </p>
          <div className="bg-black/50 border border-cyan-900/40 p-6 rounded-lg text-cyan-100 text-sm leading-relaxed whitespace-pre-wrap">
            {activeTask?.question}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ✅ MCQ Options */}
          {isMCQ(activeTask) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getOptions(activeTask).map((option, idx) => {
                const letter = getOptionLetter(idx); // "A", "B", "C", "D"
                const isSelected = selectedOption === letter;
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOption(letter)}
                    className={cn(
                      'p-4 border rounded-lg text-left text-sm font-bold tracking-wider transition-all',
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'border-gray-700 bg-black/30 text-gray-400 hover:border-cyan-800 hover:text-gray-300'
                    )}
                  >
                    <span className={cn('mr-2 font-black', isSelected ? 'text-cyan-400' : 'text-cyan-800')}>
                      {letter}.
                    </span>
                    {/* "A: URL" → "URL" strip kar ke dikhao */}
                    {option.replace(/^[A-D]:\s*/i, '')}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            /* Normal text input */
            <Input
              autoFocus
              placeholder="ENTER_DECRYPTION_KEY"
              value={answerInput}
              onChange={e => setAnswerInput(e.target.value)}
            />
          )}

          {/* Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-[10px] text-center uppercase tracking-widest"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            className="w-full h-14"
            disabled={isMCQ(activeTask) ? !selectedOption : !answerInput.trim()}
          >
            TRANSMIT_KEY <Zap size={18} className="ml-2" />
          </Button>
        </form>
      </Modal>
    </main>
  );
}