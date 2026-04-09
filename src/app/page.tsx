'use client';
import { useRouter } from 'next/navigation';
import { Terminal, Shield, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';

export default function LandingPage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-[#02050f]">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      
      {/* Background glowing orb */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600 rounded-full blur-[150px] -z-10" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center border border-cyan-500/20 bg-[#040d21]/60 backdrop-blur-md p-12 shadow-[0_0_50px_rgba(6,182,212,0.1)] rounded-3xl glow-border"
      >
        <motion.div 
          className="flex gap-6 mb-8 text-cyan-500"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Terminal size={48} className="animate-pulse" />
          <Shield size={48} />
          <Cpu size={48} />
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-black tracking-[0.2em] text-white mb-2 uppercase text-glow">
          TECH<span className="text-cyan-500">_ESCAPE</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.5em] text-cyan-600 mb-12 uppercase text-glow-emerald">
          ROOM 2K26
        </h2>
        
        <p className="max-w-2xl text-lg md:text-xl text-cyan-200/60 mb-12 font-mono leading-relaxed border-l-2 border-cyan-500/50 pl-6 text-left">
          <span className="text-red-400 font-bold">SYSTEM BREACH DETECTED.</span> <br />
          INITIATING EMERGENCY PROTOCOL: <span className="text-emerald-400">GANG-VERIFICATION</span> <br />
          YOUR SQUAD HAS 60 MINUTES TO SECURE MAINFRAME ACCESS.
        </p>

        <Button 
          className="w-full md:w-[400px] py-4 text-xl" 
          onClick={() => router.push('/login')}
        >
          [ INITIALIZE_PROTOCOL ]
        </Button>
      </motion.div>
      
      <div className="absolute bottom-8 text-xs text-cyan-800 font-mono tracking-[0.3em] uppercase">
        © 2026 Tech Escape // Unauthorized access is prohibited.
      </div>
    </div>
  );
}