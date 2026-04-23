import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Moon, Sun, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const THEME_PRESETS = [
  { id: 'indigo', name: 'Indigo Bliss', description: 'Classic professional indigo theme', preview: ['#4F46E5', '#818CF8', '#C7D2FE'] },
  { id: 'amber', name: 'Amber Glow', description: 'Warm and energetic amber tones', preview: ['#D97706', '#FBBF24', '#FEF3C7'] },
  { id: 'rose', name: 'Rose Petal', description: 'Elegant and soft rose palette', preview: ['#E11D48', '#FB7185', '#FFE4E6'] },
  { id: 'emerald', name: 'Emerald Forest', description: 'Refreshing and natural greens', preview: ['#059669', '#34D399', '#D1FAE5'] },
  { id: 'slate', name: 'Slate Gray', description: 'Minimalist and neutral slate layout', preview: ['#475569', '#94A3B8', '#F1F5F9'] },
];

export default function ThemePresetSelector() {
  const { theme, isDark, activePreset, applyPreset, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = THEME_PRESETS.find(p => p.id === activePreset) || THEME_PRESETS[0];

  const handleSelect = (id: string) => {
    applyPreset(id as any);
    setIsOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 overflow-hidden mb-4">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-[18px] h-[18px] text-indigo-600 dark:text-indigo-400" />
          <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">App Theme</span>
        </div>
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-violet-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <button 
            onClick={toggleTheme}
            className={cn(
              "relative w-10 h-6 rounded-full transition-colors duration-300",
              isDark ? "bg-indigo-600" : "bg-slate-200"
            )}
          >
            <motion.div 
              animate={{ x: isDark ? 18 : 2 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            />
          </button>
        </div>
      </div>

      {/* Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="mx-3 mb-3 px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1">
            {activeTheme.preview.map((color, i) => (
              <div key={i} className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{activeTheme.name}</span>
        </div>
        <ChevronDown className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </button>

      {/* Footer Label */}
      <div className="px-4 py-2.5 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-600" />
        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
          {activeTheme.name} • {isDark ? 'Dark' : 'Light'}
        </span>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] w-[calc(100%-48px)] max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                  Select Theme
                </span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {THEME_PRESETS.map((preset) => {
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelect(preset.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-4 border-b border-slate-50 dark:border-slate-800/50 transition-colors active:bg-slate-50 dark:active:bg-slate-800 text-left",
                        isActive && "bg-indigo-50/30 dark:bg-indigo-900/10"
                      )}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        {preset.preview.map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-white dark:border-slate-800" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn("text-[14px] font-bold leading-tight mb-0.5", isActive ? "text-indigo-600" : "text-slate-900 dark:text-white")}>
                          {preset.name}
                        </h4>
                        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                          {preset.description}
                        </p>
                      </div>
                      {isActive && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-sm font-bold text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
