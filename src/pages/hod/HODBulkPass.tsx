import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Circle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Paperclip, 
  X, 
  Loader2, 
  Send, 
  ShieldCheck,
  Plus,
  LayoutGrid,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useActionLock } from '../../context/ActionLockContext';
import { getHODDepartmentStudents, submitHODBulkPass } from '../../services/api.service';
import { cn } from '../../utils/cn';
import { SkeletonList } from '../../components/ui/Skeleton';

interface Student {
  id: number;
  regNo: string;
  fullName: string;
  department: string;
  section?: string;
  year?: string;
}

interface HODBulkPassProps {
  onBack: () => void;
}

export default function HODBulkPass({ onBack }: HODBulkPassProps) {
  const { getUserId, user } = useAuth();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const { withLock } = useActionLock();
  const hodCode = getUserId();

  const [purpose, setPurpose] = useState('');
  const [reason, setReason] = useState('');
  const [includeStaff, setIncludeStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await getHODDepartmentStudents(hodCode);
      if (res.success) {
        setStudents((res.students || []).map((s: any) => ({
          ...s, fullName: s.fullName || s.studentName || s.name || ''
        })));
      }
    } catch { showToastError('Sync Error', 'Failed to pull department registry'); }
    finally { setLoading(false); }
  };

  const getSectionKey = (s: Student) => s.section?.trim() || s.year?.trim() || 'General';

  const getFilteredStudents = () => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      s.regNo.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  };

  const getGroupedStudents = () => {
    const filtered = getFilteredStudents();
    const map = new Map<string, Student[]>();
    for (const s of filtered) {
      const key = getSectionKey(s);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, students]) => ({ key, students }));
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleStudent = (regNo: string) => {
    const next = new Set(selectedStudents);
    if (next.has(regNo)) { 
        next.delete(regNo); 
        if (receiverId === regNo) setReceiverId(null); 
    }
    else next.add(regNo);
    setSelectedStudents(next);
  };

  const toggleSectionAll = (sectionStudents: Student[]) => {
    const regNos = sectionStudents.map(s => s.regNo);
    const allSelected = regNos.every(r => selectedStudents.has(r));
    const next = new Set(selectedStudents);
    if (allSelected) {
      regNos.forEach(r => { next.delete(r); if (receiverId === r) setReceiverId(null); });
    } else {
      regNos.forEach(r => next.add(r));
    }
    setSelectedStudents(next);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredStudents();
    if (selectedStudents.size === filtered.length) {
      setSelectedStudents(new Set());
      setReceiverId(null);
    } else {
      setSelectedStudents(new Set(filtered.map(s => s.regNo)));
    }
  };

  const submitBulk = async () => {
    if (!purpose.trim() || !reason.trim()) return showToastError('Missing Fields', 'Please enter purpose and reason');
    if (selectedStudents.size === 0) return showToastError('No Selection', 'Select at least one student');
    if (!includeStaff && !receiverId) return showToastError('Missing Receiver', 'Select a QR code holder from the group');

    await withLock(async () => {
      try {
        const res = await submitHODBulkPass({
          hodCode,
          purpose: purpose.trim(),
          reason: reason.trim(),
          exitDateTime: new Date().toISOString(),
          returnDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          students: Array.from(selectedStudents),
          includeStaff,
          receiverId: includeStaff ? undefined : (receiverId || undefined),
        });
        if (res.success) {
          showToastSuccess('Batch Sent', `Authorization for ${selectedStudents.size} students has been submitted`);
          onBack();
        } else {
          showToastError('Submission Failed', res.message);
        }
      } catch {
        showToastError('Error', 'Network request failed');
      }
    }, 'Dispatching batch authorization...');
  };

  const groups = getGroupedStudents();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
               <Users className="w-7 h-7 text-white" />
            </div>
            <div>
               <h3 className="text-[18px] font-black leading-none mb-1">Batch Authorization</h3>
               <p className="text-[13px] font-bold text-indigo-100 opacity-90 uppercase tracking-widest">HOD Control</p>
            </div>
         </div>
         <p className="text-[12px] font-medium leading-relaxed opacity-80">
            Create a unified gate pass for multiple department members. You can assign a specific student or staff member as the primary QR holder.
         </p>
      </div>

      <div className="space-y-5">
         {/* Include Staff Toggle */}
         <button
            onClick={() => { setIncludeStaff(!includeStaff); if (!includeStaff) setReceiverId(null); }}
            className={cn(
              "w-full flex items-center justify-between p-5 rounded-[24px] border transition-all",
              includeStaff ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", includeStaff ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-slate-100 dark:bg-slate-800")}>
                  <ShieldCheck className={cn("w-5 h-5", includeStaff ? "text-white" : "text-slate-400")} />
               </div>
               <div className="text-left">
                  <p className={cn("text-[14px] font-black", includeStaff ? "text-indigo-900 dark:text-white" : "text-slate-900 dark:text-white")}>Include HOD/Staff</p>
                  <p className="text-[11px] font-bold text-slate-400">Staff will be the primary QR holder</p>
               </div>
            </div>
            <div className={cn("w-12 h-6 rounded-full relative transition-colors", includeStaff ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700")}>
               <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", includeStaff ? "left-7" : "left-1")} />
            </div>
         </button>

         {/* Selection Registry */}
         <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Recipients</label>
               <button onClick={selectAllFiltered} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
                  {selectedStudents.size === getFilteredStudents().length && getFilteredStudents().length > 0 ? 'Deselect All' : 'Select All'}
               </button>
            </div>

            <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4.5 h-4.5" />
               </div>
               <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, reg no..."
                  className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
               />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
               {loading ? (
                  <SkeletonList count={5} />
               ) : groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                     <Users className="w-10 h-10 text-slate-200 mb-3" />
                     <p className="text-[13px] font-bold text-slate-400">No registry matching your search</p>
                  </div>
               ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                     {groups.map(({ key, students: sectionStudents }) => {
                        const isCollapsed = collapsedSections.has(key);
                        const sectionSelected = sectionStudents.filter(s => selectedStudents.has(s.regNo)).length;
                        const allSectionSelected = sectionSelected === sectionStudents.length;
                        const someSelected = sectionSelected > 0 && !allSectionSelected;

                        return (
                           <div key={key}>
                              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30">
                                 <button onClick={() => toggleSectionAll(sectionStudents)} className="shrink-0 p-1">
                                    {allSectionSelected ? <CheckCircle2 className="w-5.5 h-5.5 text-indigo-600" /> : someSelected ? <CheckCircle2 className="w-5.5 h-5.5 text-indigo-400" /> : <Circle className="w-5.5 h-5.5 text-slate-200" />}
                                 </button>
                                 <button onClick={() => toggleSection(key)} className="flex-1 flex items-center justify-between text-left">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Section {key}</span>
                                       <span className="px-2 py-0.5 bg-indigo-600 text-[10px] font-black text-white rounded-md tracking-widest">{sectionSelected}/{sectionStudents.length}</span>
                                    </div>
                                    {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                                 </button>
                              </div>
                              {!isCollapsed && (
                                 <div className="bg-white dark:bg-slate-900">
                                    {sectionStudents.map(student => {
                                       const isSelected = selectedStudents.has(student.regNo);
                                       return (
                                          <button
                                             key={student.regNo}
                                             onClick={() => toggleStudent(student.regNo)}
                                             className={cn(
                                                "w-full flex items-center gap-4 px-6 py-4 transition-all text-left",
                                                isSelected ? "bg-indigo-50/30 dark:bg-indigo-900/10" : "active:bg-slate-50"
                                             )}
                                          >
                                             {isSelected ? <CheckCircle2 className="w-5.5 h-5.5 text-indigo-600 shrink-0" /> : <Circle className="w-5.5 h-5.5 text-slate-100 shrink-0" />}
                                             <div className="min-w-0 flex-1">
                                                <p className={cn("text-[14px] font-black truncate leading-tight", isSelected ? "text-indigo-900 dark:text-white" : "text-slate-900 dark:text-white")}>{student.fullName}</p>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{student.regNo}</p>
                                             </div>
                                          </button>
                                       );
                                    })}
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>

         {/* Receiver Selection Post-Process */}
         {!includeStaff && selectedStudents.size > 0 && (
            <div className="space-y-3">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign QR Holder</label>
               <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3">
                  <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 font-black mt-0.5" />
                  <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400/90 leading-relaxed italic">
                    The selected student will be responsible for the group's QR code scanning.
                  </p>
               </div>
               <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800/30 max-h-[240px] overflow-y-auto">
                  {Array.from(selectedStudents).map(regNo => {
                    const student = students.find(s => s.regNo === regNo);
                    if (!student) return null;
                    const isRcv = receiverId === regNo;
                    return (
                      <button
                        key={regNo}
                        onClick={() => setReceiverId(regNo)}
                        className={cn(
                          "w-full flex items-center gap-4 px-6 py-4 transition-all text-left",
                          isRcv ? "bg-amber-50/50 dark:bg-amber-900/10" : "active:bg-slate-50"
                        )}
                      >
                         <div className={cn("w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isRcv ? "border-amber-500 bg-amber-500 shadow-md shadow-amber-100" : "border-slate-100 bg-slate-50")}>
                           {isRcv && <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className={cn("text-[14px] font-black truncate", isRcv ? "text-amber-900 dark:text-white" : "text-slate-900 dark:text-white")}>{student.fullName}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase">{student.regNo} • {getSectionKey(student)}</p>
                         </div>
                         {isRcv && <span className="px-2 py-0.5 bg-amber-500 text-[8px] font-black text-white rounded-md uppercase tracking-widest">Receiver</span>}
                      </button>
                    );
                  })}
               </div>
            </div>
         )}

         {/* General Particulars */}
         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Purpose</label>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                     <LayoutGrid className="w-5 h-5" />
                  </div>
                  <input 
                     value={purpose}
                     onChange={(e) => setPurpose(e.target.value)}
                     placeholder="Ex: Industrial Visit, Seminar..."
                     className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-[15px] font-bold text-slate-900 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Reason</label>
               <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for the group's exit authorization..."
                  className="w-full min-h-[100px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-[15px] font-bold text-slate-900 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none"
               />
            </div>
         </div>

         <div className="pt-4">
            <button 
               onClick={submitBulk}
               disabled={selectedStudents.size === 0}
               className="w-full h-15 bg-emerald-600 rounded-2xl text-white font-black text-[15px] uppercase tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
            >
               <Send className="w-5 h-5" />
               Submit for {selectedStudents.size} members
            </button>
         </div>
      </div>
    </div>
  );
}
