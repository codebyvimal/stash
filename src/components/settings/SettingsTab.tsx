import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Save, Download, Trash2, Database, HardDrive } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SettingsTab() {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const clearAll = useStore(s => s.clearAll);
  const transactions = useStore(s => s.transactions);
  const tasks = useStore(s => s.tasks);
  const rewards = useStore(s => s.rewards);
  const [dailyGoal, setDailyGoal] = useState(settings.daily_goal.toString());
  const [currencyName, setCurrencyName] = useState(settings.currency_name);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    updateSettings({
      daily_goal: parseInt(dailyGoal) || 500,
      currency_name: currencyName || 'pts',
    });
    // Normally you'd want to show a toast here.
  };

  const handleExport = () => {
    const data = { transactions, tasks, rewards, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tally-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (showConfirm) {
      clearAll();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Settings</h1>
        <p className="text-slate-500 text-sm">Configure your app and manage your data.</p>
      </div>

      <div className="space-y-8">
        {/* Connection Status */}
        <section className="bg-white/40 p-5 rounded-2xl border border-white/40 shadow-sm backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-4">Storage Mode</h2>
          {supabase ? (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Connected to Supabase</p>
                  <p className="text-sm text-slate-500 mt-1">Your data is being continuously synced to the cloud.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await supabase?.auth.signOut();
                  clearAll();
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Local Storage Mode</p>
                <p className="text-sm text-slate-500 mt-1">Your data is saved only on this device. Provide Supabase environment variables to enable cloud sync.</p>
              </div>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="bg-white/40 p-5 rounded-2xl border border-white/40 shadow-sm backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Daily Goal</label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency Name</label>
              <input
                type="text"
                value={currencyName}
                onChange={(e) => setCurrencyName(e.target.value)}
                placeholder="pts, gold, XP..."
                className="w-full bg-white/60 border border-white/40 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors mt-2"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white/40 p-5 rounded-2xl border border-white/40 shadow-sm backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/60 border border-white/40 text-slate-700 rounded-xl font-medium hover:bg-white/80 transition-colors w-full"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export Data (JSON)
            </button>

            <div className="pt-2 border-t border-slate-200/50">
              {showConfirm ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
                  >
                    Yes, delete everything
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 rounded-xl font-medium hover:bg-rose-50 transition-colors w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Erase All Data
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
