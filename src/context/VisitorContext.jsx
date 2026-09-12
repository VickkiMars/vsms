import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS } from '../data/initialData';
import { sqliteService } from '../db/sqliteDb';
import confetti from 'canvas-confetti';

const VisitorContext = createContext(null);

export const VisitorProvider = ({ children }) => {
  // State for visitor records synced with SQLite DB & LocalStorage
  const [visitors, setVisitors] = useState(() => {
    const saved = localStorage.getItem('vsms_visitors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_VISITORS;
  });

  // Sync SQLite visitors on mount
  useEffect(() => {
    sqliteService.initPromise.then(() => {
      const dbVisitors = sqliteService.getAllVisitors();
      if (dbVisitors && dbVisitors.length > 0) {
        setVisitors(dbVisitors);
      }
    });
  }, []);

  // LocalStorage state for light theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vsms_theme') || 'light';
  });

  // User Role: 'security' | 'admin' | 'reception'
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('vsms_role') || 'admin';
  });

  // Active View: 'live' | 'log' | 'analytics' | 'departments' | 'settings'
  const [activeView, setActiveView] = useState('live');

  // Modals & Panels
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filter Global State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Save visitors to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('vsms_visitors', JSON.stringify(visitors));
  }, [visitors]);

  // Sync theme with HTML document class and color scheme
  useEffect(() => {
    localStorage.setItem('vsms_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Sync role to LocalStorage
  useEffect(() => {
    localStorage.setItem('vsms_role', userRole);
  }, [userRole]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdKOpen(false);
        setIsCheckInOpen(false);
        setIsBadgeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action: Register New Visitor
  const registerVisitor = (formData) => {
    const newId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingMaxBadge = visitors.reduce((max, v) => {
      const num = parseInt(v.badgeId?.replace(/^BDG-/, '') || '0', 10);
      return num > max ? num : max;
    }, 80);
    const badgeId = `BDG-${String(existingMaxBadge + 1).padStart(3, '0')}`;

    const newVisitor = {
      id: newId,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || 'N/A',
      company: formData.company || 'Private Guest',
      idType: formData.idType,
      idNumber: formData.idNumber,
      hostName: formData.hostName,
      department: formData.department,
      purpose: formData.purpose,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      status: 'Checked-In',
      badgeId: badgeId,
      expectedDurationMinutes: parseInt(formData.expectedDurationMinutes || '60', 10),
      vehiclePlate: formData.vehiclePlate || 'N/A',
      notes: formData.notes || '',
      avatar: formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName)}&backgroundColor=171717,262626,404040,737373&textColor=ffffff`,
    };

    // Save in SQLite DB
    sqliteService.insertVisitor(newVisitor);

    setVisitors(prev => [newVisitor, ...prev]);
    setIsCheckInOpen(false);

    // Trigger monochrome celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']
      });
    } catch (e) {
      console.log('Confetti failed gracefully', e);
    }

    // Auto open visitor badge modal
    setSelectedVisitorForBadge(newVisitor);
    setIsBadgeModalOpen(true);
    return newVisitor;
  };

  // Action: Check Out Visitor
  const checkOutVisitor = (visitorId) => {
    const nowIso = new Date().toISOString();
    sqliteService.updateVisitorStatus(visitorId, 'Checked-Out', nowIso);
    setVisitors(prev => prev.map(v => {
      if (v.id === visitorId) {
        return {
          ...v,
          checkOutTime: nowIso,
          status: 'Checked-Out'
        };
      }
      return v;
    }));
  };

  // Action: Open Badge Modal
  const openBadgeModal = (visitor) => {
    setSelectedVisitorForBadge(visitor);
    setIsBadgeModalOpen(true);
  };

  // Action: Reset Data
  const resetToDemoData = () => {
    sqliteService.resetDatabase();
    setVisitors(INITIAL_VISITORS);
    localStorage.removeItem('vsms_visitors');
  };

  // Helper: Export to CSV
  const exportToCSV = () => {
    const headers = ['Visitor ID', 'Full Name', 'Phone', 'Email', 'Company', 'ID Type', 'ID Number', 'Host', 'Department', 'Purpose', 'Check-In', 'Check-Out', 'Status', 'Badge ID'];
    const rows = visitors.map(v => [
      v.id,
      `"${(v.fullName || '').replace(/"/g, '""')}"`,
      `"${(v.phone || '').replace(/"/g, '""')}"`,
      `"${(v.email || '').replace(/"/g, '""')}"`,
      `"${(v.company || '').replace(/"/g, '""')}"`,
      `"${(v.idType || '').replace(/"/g, '""')}"`,
      `"${(v.idNumber || '').replace(/"/g, '""')}"`,
      `"${(v.hostName || '').replace(/"/g, '""')}"`,
      `"${(v.department || '').replace(/"/g, '""')}"`,
      `"${(v.purpose || '').replace(/"/g, '""')}"`,
      `"${new Date(v.checkInTime).toLocaleString()}"`,
      v.checkOutTime ? `"${new Date(v.checkOutTime).toLocaleString()}"` : 'On-Premises',
      v.status,
      v.badgeId
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VSMS_Visitor_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <VisitorContext.Provider value={{
      visitors,
      departments: DEPARTMENTS,
      hosts: HOSTS,
      theme,
      toggleTheme,
      userRole,
      setUserRole,
      activeView,
      setActiveView,
      isCheckInOpen,
      setIsCheckInOpen,
      isBadgeModalOpen,
      setIsBadgeModalOpen,
      selectedVisitorForBadge,
      setSelectedVisitorForBadge,
      openBadgeModal,
      isCmdKOpen,
      setIsCmdKOpen,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
      selectedDeptFilter,
      setSelectedDeptFilter,
      selectedStatusFilter,
      setSelectedStatusFilter,
      registerVisitor,
      checkOutVisitor,
      resetToDemoData,
      exportToCSV,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitorContext = () => useContext(VisitorContext);
