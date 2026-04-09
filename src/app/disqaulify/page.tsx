'use client';
import { useRouter } from 'next/navigation';
import { Skull } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';

export default function DisqualifyPage() {
  const router = useRouter();

  const handleRestart = () => {
    router.push('/');
  };

  return (
    <main className="flex-1 w-full min-h-screen bg-[#110000] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none" />
      
      <motion.div 
         animate={{ opacity: [0.1, 0.3, 0.1] }}
         transition={{ duration: 2, repeat: Infinity }}
         className="absolute w-full h-[500px] bg-red-600 rounded-[100%] blur-[200px] -z-10" 
      />

      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 10 }}
        className="z-10 flex flex-col items-center text-center max-w-3xl"
      >
        <motion.div
           animate={{ x: [-5, 5, -5] }}
           transition={{ repeat: Infinity, duration: 0.1 }}
           className="mb-8"
        >
          <Skull size={120} className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,1)]" />
        </motion.div>
        
        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-[0.2em] text-white">
          <span className="text-red-600 font-serif">FATAL</span> ERROR
        </h1>
        
        <div className="bg-red-950/30 border-l-4 border-r-4 border-red-600 py-6 px-12 md:px-24 mb-12">
          <p className="text-2xl text-red-400 font-mono tracking-widest uppercase">
            Security Breach Detected
          </p>
          <p className="text-red-500/70 text-sm mt-3 font-mono">CODE: DISQUALIFIED // TIME EXPIRED OR RULES VIOLATED</p>
        </div>

        <Button variant="danger" onClick={handleRestart} className="px-12 py-5 text-xl w-full md:w-auto">
          [ PURGE_AND_REBOOT ]
        </Button>
      </motion.div>
    </main>
  );
}