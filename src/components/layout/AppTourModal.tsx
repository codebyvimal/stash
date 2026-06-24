import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2, Clock, Award, Target } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

const tourSlides = [
  {
    title: "Welcome to Stash",
    description: "Your personal task economy. Plan tasks, complete them, and earn points to treat yourself.",
    icon: Target,
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    title: "The 3-Hour Rule",
    description: "When you add a task, its points are locked. Even if you finish it quickly, the points are only credited 3 hours after creation. This promotes deep work and prevents cheating.",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    title: "Treat Yourself",
    description: "Set up your own custom rewards—like a movie night or guilt-free gaming. Spend your hard-earned points on things you love.",
    icon: Award,
    color: "text-rose-500",
    bg: "bg-rose-50"
  },
  {
    title: "Track & Grow",
    description: "Monitor your progress, build streaks, and stay consistent. You're now ready to start your journey!",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  }
];

export function AppTourModal() {
  const { isTourOpen, setTourOpen, updateSettings } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isTourOpen) return null;

  const handleNext = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setTourOpen(false);
    updateSettings({ has_seen_tour: true });
    // reset slide after animation
    setTimeout(() => setCurrentSlide(0), 300);
  };

  const slide = tourSlides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${slide.bg} ${slide.color}`}>
                <Icon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {slide.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-4">
          <div className="flex justify-center gap-2 mb-2">
            {tourSlides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/20"
          >
            {currentSlide === tourSlides.length - 1 ? (
              "Get Started"
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
