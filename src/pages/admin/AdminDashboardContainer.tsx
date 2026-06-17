import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminNewPass from './AdminNewPass';
import AdminMyRequests from './AdminMyRequests';
import AdminScanHistory from './AdminScanHistory';
import ProfilePage from '../shared/ProfilePage';
import GuestPreRequest from '../shared/GuestPreRequest';

type InternalTab = 'DASHBOARD' | 'PROFILE' | 'NEW_PASS' | 'MY_REQUESTS' | 'SCAN_HISTORY' | 'GUEST';

export default function AdminDashboardContainer() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<InternalTab>('DASHBOARD');

  if (!user) return null;

  const handleNavigate = (tag: string) => {
    if (tag === 'PROFILE') setActiveTab('PROFILE');
    else if (tag === 'NEW_PASS' || tag === 'ADMIN_NEW_PASS') setActiveTab('NEW_PASS');
    else if (tag === 'MY_REQUESTS' || tag === 'ADMIN_MY_REQUESTS') setActiveTab('MY_REQUESTS');
    else if (tag === 'SCAN_HISTORY' || tag === 'ADMIN_SCAN_HISTORY') setActiveTab('SCAN_HISTORY');
    else if (tag === 'GUEST' || tag === 'GUEST_PRE_REQUEST') setActiveTab('GUEST');
    else setActiveTab('DASHBOARD');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'PROFILE':
        return <ProfilePage onBack={() => setActiveTab('DASHBOARD')} user={user} />;
      case 'NEW_PASS':
        return <AdminNewPass onBack={() => setActiveTab('DASHBOARD')} />;
      case 'MY_REQUESTS':
        return <AdminMyRequests onBack={() => setActiveTab('DASHBOARD')} />;
      case 'SCAN_HISTORY':
        return <AdminScanHistory onBack={() => setActiveTab('DASHBOARD')} />;
      case 'GUEST':
        return <GuestPreRequest onBack={() => setActiveTab('DASHBOARD')} />;
      default:
        return <AdminDashboard onNavigate={handleNavigate} onLogout={logout} />;
    }
  };

  return (
    <div className="min-h-screen lg:min-h-0 lg:bg-transparent bg-[#F8FAFC] dark:bg-slate-950">
      {renderContent()}
    </div>
  );
}
