'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-cyan-400 hover:scale-110 transition-all active:scale-95 shadow-sm dark:shadow-none overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ y: theme === 'dark' ? 0 : 40, opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Moon size={18} />
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ y: theme === 'light' ? 0 : -40, opacity: theme === 'light' ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Sun size={18} />
      </motion.div>
    </button>
  );
}
