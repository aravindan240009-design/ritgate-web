import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import HRDashboard from './HRDashboard';
import HRGateLogs from './HRGateLogs';
import ProfilePage from '../shared/ProfilePage';

type InternalTab = 'DASHBOARD' | 'GATE_LOGS' | 'PROFILE';

export default function HRDashboardContainer() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<InternalTab>('DASHBOARD');

  if (!user) return null;

  const handleNavigate = (tag: string) => {
    if (tag === 'GATE_LOGS') setActiveTab('GATE_LOGS');
    else if (tag === 'PROFILE') setActiveTab('PROFILE');
    else setActiveTab('DASHBOARD');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'GATE_LOGS':
        return <HRGateLogs onBack={() => setActiveTab('DASHBOARD')} />;
      case 'PROFILE':
        return <ProfilePage user={user} onBack={() => setActiveTab('DASHBOARD')} />;
      default:
        return <HRDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      {renderContent()}
    </div>
  );
}
