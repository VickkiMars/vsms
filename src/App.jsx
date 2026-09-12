import React from 'react';
import { VisitorProvider, useVisitorContext } from './context/VisitorContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickCheckInModal } from './components/QuickCheckInModal';
import { VisitorPassModal } from './components/VisitorPassModal';
import { CommandPalette } from './components/CommandPalette';
import { LoginModal } from './components/LoginModal';
import { LiveTrackerView } from './views/LiveTrackerView';
import { VisitorLogView } from './views/VisitorLogView';
import { AnalyticsView } from './views/AnalyticsView';
import { DepartmentsView } from './views/DepartmentsView';
import { SettingsView } from './views/SettingsView';

const MainLayout = () => {
  const { activeView } = useVisitorContext();

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f4f8fa_0%,#eef5f7_40%,#e4eff2_100%)] dark:bg-neutral-950 text-neutral-900 dark:text-white selection:bg-neutral-950 selection:text-white font-sans antialiased p-2 sm:p-4 md:p-6 transition-colors">
      {/* Main 2-Column Shell Wrapper */}
      <div className="max-w-[1580px] mx-auto min-h-[92vh] flex flex-col md:flex-row gap-3 md:gap-5 rounded-4xl bg-transparent">
        
        {/* 1. Left Sidebar Navigation */}
        <Sidebar />

        {/* 2. Main Central Content Area */}
        <div className="flex-1 flex flex-col min-w-0 gap-6 py-2">
          <Header />
          
          <main className="flex-1 p-2 md:p-4 overflow-y-auto">
            {activeView === 'live' && <LiveTrackerView />}
            {activeView === 'log' && <VisitorLogView />}
            {activeView === 'analytics' && <AnalyticsView />}
            {activeView === 'departments' && <DepartmentsView />}
            {activeView === 'settings' && <SettingsView />}
          </main>
        </div>

      </div>

      {/* Modals & Overlays */}
      <QuickCheckInModal />
      <VisitorPassModal />
      <CommandPalette />
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <VisitorProvider>
        <MainLayout />
      </VisitorProvider>
    </AuthProvider>
  );
}

