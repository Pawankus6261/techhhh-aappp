'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  className?: string;
}

export default function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  const base = "relative overflow-hidden font-black tracking-[0.3em] uppercase py-3 px-6 transition-colors duration-300 border flex items-center justify-center gap-2 rounded-lg group";
  
  const variants = {
    primary: "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-[#02050f] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    danger: "bg-red-950/40 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-[#02050f] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    success: "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-[#02050f] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]",
    ghost: "border-transparent text-cyan-700/50 hover:text-cyan-400 hover:border-cyan-500/30"
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(base, variants[variant], className)} 
      {...(props as any)}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}