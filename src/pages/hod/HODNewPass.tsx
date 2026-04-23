import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Users, 
  UserPlus, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import HODNewPassRequest from './HODNewPassRequest';
import HODBulkPass from './HODBulkPass';

type Stage = 'SELECT' | 'SINGLE' | 'BULK' | 'GUEST';

export default function HODNewPass() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Derive stage from URL query param
  const params = new URLSearchParams(location.search);
  const stageParam = params.get('stage')?.toUpperCase() as Stage | null;
  const stage: Stage = (stageParam && ['SINGLE', 'BULK', 'GUEST'].includes(stageParam)) ? stageParam : 'SELECT';

  const handleBack = () => {
    if (stage === 'SELECT') navigate(-1);
    else navigate('/new-pass');
  };

  const hodName = (user as any)?.hodName || (user as any)?.name || 'HOD Member';

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 h-[72px] flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-90 transition-transform border border-slate-100 dark:border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {stage === 'SELECT' ? 'New Request' : stage === 'SINGLE' ? 'Personal Pass' : stage === 'BULK' ? 'Bulk Gate Pass' : 'Guest Pass'}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-28">
        <AnimatePresence mode="wait">
          {stage === 'SELECT' && (
            <motion.div 
               key="stage-selection"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
            >
               <div className="mb-8">
                  <h2 className="text-[24px] font-black text-slate-900 dark:text-white leading-tight">Create Gate Pass</h2>
                  <p className="text-[14px] font-bold text-slate-400 mt-1">Select authorization type for your department</p>
               </div>

               <div className="grid gap-4">
                  {[
                    { id: 'SINGLE', title: 'Personal Pass', sub: 'For your official/personal exit', icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { id: 'BULK', title: 'Bulk Gate Pass', sub: 'For students/staff group movement', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { id: 'GUEST', title: 'Guest Pass', sub: 'Pre-register visitors for entry', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={card.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (card.id === 'GUEST') navigate('/guest-register');
                          else navigate(`/new-pass?stage=${card.id.toLowerCase()}`);
                        }}
                        className="w-full p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-5 text-left shadow-sm transition-all active:shadow-none"
                      >
                         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", card.bg)}>
                            <Icon className={cn("w-7 h-7", card.color)} />
                         </div>
                         <div className="flex-1">
                            <h3 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">{card.title}</h3>
                            <p className="text-[13px] font-bold text-slate-400">{card.sub}</p>
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-200" />
                      </motion.button>
                    );
                  })}
               </div>
            </motion.div>
          )}

          {stage === 'SINGLE' && (
            <motion.div 
               key="stage-single"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="h-full"
            >
               <HODNewPassRequest user={user} onBack={() => navigate('/new-pass')} />
            </motion.div>
          )}

          {stage === 'BULK' && (
             <motion.div 
               key="stage-bulk"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="h-full"
             >
                <HODBulkPass onBack={() => navigate('/new-pass')} />
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
