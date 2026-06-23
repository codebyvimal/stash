import { motion } from 'framer-motion';
import { LayoutDashboard, Award, History, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rewards', label: 'Claim', icon: Award },
  { id: 'history', label: 'History', icon: History },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 border-r border-white/40 flex-col justify-between py-8 px-6 bg-white/20 z-20 backdrop-blur-md shrink-0">
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center mb-12 pl-2">
          <motion.img 
            src="/Logo-big-name.png"
            alt="Tally Logo"
            whileHover={{ scale: 1.05 }}
            className="h-10 object-contain drop-shadow-sm"
          />
        </div>

        <nav className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium transition-all relative whitespace-nowrap",
                  isActive ? "text-slate-900" : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute inset-0 bg-white/60 shadow-sm rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 z-10 transition-opacity", isActive ? "opacity-100" : "opacity-70")} />
                <span className="z-10 text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="w-full mt-8">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium transition-all relative whitespace-nowrap w-full",
            activeTab === 'settings' ? "text-slate-900" : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
          )}
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="activeTabDesktop"
              className="absolute inset-0 bg-white/60 shadow-sm rounded-xl"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <Settings className={cn("w-4 h-4 z-10 transition-opacity", activeTab === 'settings' ? "opacity-100" : "opacity-70")} />
          <span className="z-10 text-sm">Settings</span>
        </button>
      </div>
    </aside>
  );
}
