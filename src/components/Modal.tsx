'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 bg-[#02050f]/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              'relative z-10 w-full max-w-xl bg-[#040d21] border border-cyan-500/40 p-1 md:p-2 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden glow-border',
              className
            )}
          >
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #06b6d4 2px, #06b6d4 4px)` }}></div>
            <div className="relative bg-[#02050f] p-6 rounded-lg w-full h-full">
              <div className="flex items-center justify-between mb-8 border-b border-cyan-900/50 pb-4 relative">
                <div className="absolute -bottom-[1px] left-0 w-1/3 h-[1px] bg-cyan-400" />
                <h2 className="text-xl md:text-2xl font-black text-cyan-400 tracking-[0.2em] uppercase">
                  {title}
                  <motion.span 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="ml-2 inline-block w-3 h-5 bg-cyan-500 align-middle"
                  />
                </h2>
                <button
                  onClick={onClose}
                  className="text-cyan-700 hover:text-cyan-400 p-2 transition-all hover:bg-cyan-950/50 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="relative z-20">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
