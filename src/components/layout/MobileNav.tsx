import { motion } from 'framer-motion';
import { LayoutDashboard, Award, History, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../hooks/useStore';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rewards', label: 'Claim', icon: Award },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { settings, setTourOpen } = useStore();
  const showTour = !settings.has_seen_tour;

  return (
    <header className="md:hidden w-full px-6 pt-6 pb-2 flex justify-between items-center border-b border-white/20 z-20">
      <img src="/Logo-big-name.png" alt="Stash Logo" className="h-6 object-contain" />
      <nav className="flex gap-4 text-sm font-medium text-slate-600 items-center">
        {showTour && (
          <button
            onClick={() => setTourOpen(true)}
            className="relative pb-1 transition-colors text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Tour
            <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </button>
        )}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative pb-1 transition-colors",
                isActive ? "text-slate-900 font-semibold" : "hover:text-slate-900"
              )}
            >
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
