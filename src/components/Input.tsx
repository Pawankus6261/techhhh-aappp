'use client';
import { InputHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from "../utils/cn";

interface InputProps extends Omit<HTMLMotionProps<"input">, "className"> {
  className?: string;
}

export default function Input({ className, ...props }: InputProps) {
  return (
    <motion.input
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full bg-[#02050f]/80 border border-cyan-800/80 focus:border-cyan-400 p-4 text-cyan-300 text-center font-mono outline-none tracking-[0.2em] transition-all rounded-lg shadow-inner placeholder-cyan-900/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]", 
        className
      )}
      {...(props as any)}
    />
  );
}