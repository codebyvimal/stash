import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden text-slate-800">
      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-12 left-1/4 w-72 h-72 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse pointer-events-none md:block hidden" />
      <div className="fixed bottom-16 right-1/4 w-80 h-80 bg-rose-400/30 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none md:block hidden" />
      
      {/* Mobile Specific Orbs */}
      <div className="fixed top-12 left-1/3 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse pointer-events-none md:hidden block" />
      <div className="fixed bottom-16 right-1/3 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none md:hidden block" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl h-[90vh] md:h-[85vh] min-h-[600px] max-h-[850px] md:max-h-[800px] 
                   glass-panel rounded-[32px] md:rounded-[40px] 
                   shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] 
                   flex flex-col md:flex-row overflow-hidden relative z-10 
                   md:shadow-2xl md:shadow-slate-900/10"
      >
        {children}
      </motion.div>
    </div>
  );
}
