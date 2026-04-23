import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Trash2, 
  ShieldCheck, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User,
  Mail,
  Smartphone,
  CreditCard,
  Target,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';
import { 
  getStudentGatePassRequests, 
  getStaffOwnRequests, 
  getHODMyRequests,
  getNCIOwnRequests,
  getNTFOwnRequests
} from '../../services/api.service';
import { cn } from '../../utils/cn';
import { isToday } from '../../utils/dateUtils';
import TopRefreshControl from '../../components/common/TopRefreshControl';
import { Skeleton } from '../../components/ui/Skeleton';

interface ProfilePageProps {
  user?: any;
  onBack?: () => void;
}

export default function ProfilePage({ user: propUser, onBack }: ProfilePageProps = {}) {
  const navigate = useNavigate();
  const { user: authUser, role, getUserId, logout } = useAuth();
  const user = propUser || authUser;
  const { theme, setTheme } = useTheme();
  const { profileImage, captureImage, clearProfileImage } = useProfile();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ approved: 0, rejected: 0, pending: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState((user as any)?.contactNo || (user as any)?.phone || '');
  const [editEmail, setEditEmail] = useState((user as any)?.email || '');
  const [saving, setSaving] = useState(false);

  const userId = getUserId();
  const userName = (() => {
    if (!user) return 'User';
    const u = user as any;
    return u.fullName || u.staffName || u.hodName || u.hrName || u.name ||
      (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : '') || 'User';
  })();

  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const department = (user as any)?.department || (user as any)?.branch || (user as any)?.gateAssigned || 'General';

  const fetchStats = useCallback(async () => {
    if (!userId || !role) return;
    setLoadingStats(true);
    try {
      let reqs: any[] = [];
      if (role === 'STUDENT') {
        const res = await getStudentGatePassRequests(userId);
        if (res.success) reqs = res.requests;
      } else if (role === 'STAFF') {
        // Handle NCI/NTF if user has تلك sub-roles (Check user props if available)
        const res = await getStaffOwnRequests(userId);
        if (res.success) reqs = res.requests;
      } else if (role === 'HOD') {
        const res = await getHODMyRequests(userId);
        if (res.success) reqs = res.requests;
      }

      const today = reqs.filter(r => isToday(r.requestDate || r.createdAt || r.exitDateTime));
      setStats({
        approved: today.filter(r => r.status === 'APPROVED').length,
        rejected: today.filter(r => r.status === 'REJECTED').length,
        pending: today.filter(r => r.status !== 'APPROVED' && r.status !== 'REJECTED').length,
      });
    } catch {
      // silent fail
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate API call as in mobile
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      showToastSuccess('Profile Updated', 'Your changes have been synced with the registry');
    }, 1200);
  };

  const menuItems = [
    { label: 'ID', value: userId, icon: CreditCard, color: 'text-indigo-500' },
    { label: 'EMAIL', value: editEmail, icon: Mail, color: 'text-violet-500', editable: true, field: 'email' },
    { label: 'PHONE', value: editPhone, icon: Smartphone, color: 'text-emerald-500', editable: true, field: 'phone' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header
        className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 h-[72px] flex items-center justify-between">
          <button
            onClick={onBack || (() => navigate(-1))}
            className="w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Profile</h1>
          <div className="w-11" />
        </div>
      </header>

      <TopRefreshControl refreshing={refreshing} onRefresh={handleRefresh}>
        <div className="px-5 pt-6 pb-32 min-h-[calc(100vh-100px)]">
          {/* 1. Header Section */}
          <div className="flex flex-col items-center mb-8">
             <div className="relative mb-4">
                <div className="w-[100px] h-[100px] rounded-full border-2 border-indigo-500 p-1 flex items-center justify-center bg-white dark:bg-slate-900 shadow-xl shadow-indigo-100">
                   {profileImage ? (
                      <img src={profileImage} alt={userName} className="w-full h-full rounded-full object-cover" />
                   ) : (
                      <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[36px] font-black text-indigo-500">
                         {initials}
                      </div>
                   )}
                </div>
                <button 
                  onClick={() => captureImage()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                   <Camera className="w-4 h-4" />
                </button>
             </div>
             <h2 className="text-[22px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{userName}</h2>
             <p className="text-[13px] font-bold text-slate-400 opacity-80">{role} | DEPT: {department}</p>
          </div>

          {/* 2. Stats Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 flex justify-between border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
             {[
               { label: 'APPROVED', value: stats.approved, color: 'text-emerald-500' },
               { label: 'REJECTED', value: stats.rejected, color: 'text-rose-500' },
               { label: 'PENDING', value: stats.pending, color: 'text-amber-500' },
             ].map((stat, i) => (
               <React.Fragment key={stat.label}>
                 <div className="flex flex-col items-center flex-1">
                    <span className={cn("text-[20px] font-black mb-0.5", stat.color)}>{stat.value}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{stat.label}</span>
                 </div>
                 {i < 2 && <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800 self-center" />}
               </React.Fragment>
             ))}
          </div>

          {/* 3. Theme Section */}
          <div className="mb-8">
             <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Interface Theme</h3>
                <button onClick={() => setTheme('light')} className="text-[10px] font-bold text-slate-300">Reset</button>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-[28px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm flex gap-2">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 transition-all",
                    theme === 'light' ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50" : "text-slate-400"
                  )}
                >
                   <Sun className="w-5 h-5" />
                   <span className="text-[12px] font-black uppercase tracking-widest">Light</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 transition-all",
                    theme === 'dark' ? "bg-slate-800 text-white shadow-sm border border-slate-700" : "text-slate-400"
                  )}
                >
                   <Moon className="w-5 h-5" />
                   <span className="text-[12px] font-black uppercase tracking-widest">Dark</span>
                </button>
             </div>
          </div>

          {/* 4. Personal Info Section */}
          <div className="mb-10">
             <div className="mb-4 px-2">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Personal Information</h3>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
                {menuItems.map((item) => (
                  <div key={item.label} className="p-5 flex items-center gap-4">
                     <div className={cn("w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0", item.color)}>
                        <item.icon className="w-5.5 h-5.5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{item.label}</p>
                        {isEditing && item.editable ? (
                           <input 
                              value={item.field === 'email' ? editEmail : editPhone}
                              onChange={(e) => item.field === 'email' ? setEditEmail(e.target.value) : setEditPhone(e.target.value)}
                              className="w-full text-[14px] font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 outline-none"
                           />
                        ) : (
                           <p className="text-[14px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight italic">
                             {item.value || 'N/A'}
                           </p>
                        )}
                     </div>
                  </div>
                ))}
             </div>
             {isEditing && (
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full h-14 bg-indigo-600 rounded-2xl mt-4 text-white font-black text-[14px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                   {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
             )}
          </div>

          {/* 5. Logout Section */}
          <button 
            onClick={logout}
            className="w-full h-15 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 rounded-[28px] flex items-center justify-center gap-3 text-rose-500 font-black text-[15px] uppercase tracking-[0.1em] shadow-sm active:bg-rose-50 transition-colors"
          >
             <LogOut className="w-5 h-5" />
             Log Out of Session
          </button>

          <div className="mt-12 text-center pb-12">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-1">RIT Gate Matrix v2.0</p>
             <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest italic opacity-50">Secure Infrastructure Node 42</p>
          </div>
        </div>
      </TopRefreshControl>
    </div>
  );
}
