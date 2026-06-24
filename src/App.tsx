import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { BalanceHeader } from './components/dashboard/BalanceHeader';
import { useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/auth/AuthScreen';
import { Loader2 } from 'lucide-react';
import { useStore } from './hooks/useStore';
import { AppTourModal } from './components/layout/AppTourModal';

// Lazy loaded components for code splitting
const TaskPlanner = lazy(() => import('./components/dashboard/TaskPlanner').then(m => ({ default: m.TaskPlanner })));
const TaskList = lazy(() => import('./components/dashboard/TaskList').then(m => ({ default: m.TaskList })));
const RewardPreview = lazy(() => import('./components/dashboard/RewardPreview').then(m => ({ default: m.RewardPreview })));
const HistoryTab = lazy(() => import('./components/history/HistoryTab').then(m => ({ default: m.HistoryTab })));
const RewardsTab = lazy(() => import('./components/rewards/RewardsTab').then(m => ({ default: m.RewardsTab })));
const SettingsTab = lazy(() => import('./components/settings/SettingsTab').then(m => ({ default: m.SettingsTab })));

function LazyFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400 opacity-50" />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { session, loading, isSupabaseConfigured } = useAuth();
  const initFromSupabase = useStore(s => s.initFromSupabase);

  useEffect(() => {
    if (session) {
      initFromSupabase();
    }
  }, [session, initFromSupabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isSupabaseConfigured && !session) {
    return (
      <AppShell>
        <AuthScreen />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* =======================
          DESKTOP SIDEBAR 
          ======================= */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* =======================
          MOBILE TOPBAR
          ======================= */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* =======================
          MAIN CONTENT AREA
          ======================= */}
      <main className="flex-1 overflow-y-auto px-5 py-6 md:px-10 md:py-8 relative no-scrollbar flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col max-w-3xl mx-auto w-full md:block space-y-6 md:space-y-0"
            >
              <Suspense fallback={<LazyFallback />}>
                {/* Balance + Daily Goal header */}
                <BalanceHeader />

                {/* Task Planner (add tasks) */}
                <TaskPlanner />

                <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 pb-10 flex-1 mt-4 md:mt-8 pt-2">
                  {/* Tasks (pending + recently completed) */}
                  <TaskList />

                  {/* Rewards preview */}
                  <RewardPreview onViewCatalog={() => setActiveTab('rewards')} />
                </div>
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              <Suspense fallback={<LazyFallback />}>
                <HistoryTab />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              <Suspense fallback={<LazyFallback />}>
                <RewardsTab />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col overflow-y-auto no-scrollbar"
            >
              <Suspense fallback={<LazyFallback />}>
                <SettingsTab />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AppTourModal />
    </AppShell>
  );
}
