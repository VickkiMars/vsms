import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS } from '../data/initialData';
import { sqliteService, DEFAULT_ORG_FIELDS } from '../db/sqliteDb';
import { useAuthContext } from './AuthContext';
import confetti from 'canvas-confetti';

const VisitorContext = createContext(null);

const DUMMY_IDS = new Set(['VIS-1001', 'VIS-1002', 'VIS-1003', 'VIS-1004', 'VIS-1005', 'VIS-1006']);
const DUMMY_NAMES = new Set([
  'Chief Marcus Vance', 'Dr. Aisha Sterling', 'Engr. David Okeke', 
  'Hon. Fatima Bello', 'Captain Emeka Nwosu', 'Barr. Chinedu Orji'
]);

const sanitizeVisitorList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(v => v && !DUMMY_IDS.has(v.id) && !DUMMY_NAMES.has(v.fullName));
};

export const VisitorProvider = ({ children }) => {
  const { currentOrg, userRole: authRole } = useAuthContext();
  const currentOrgId = currentOrg?.id || 'ORG-DEMO-01';

  // Dynamic Organization Fields (Form Builder Schema)
  const [orgFields, setOrgFields] = useState(DEFAULT_ORG_FIELDS);

  // Departments and Hosts (scoped by organization)
  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [hosts, setHosts] = useState(HOSTS);

  // Visitors list
  const [visitors, setVisitors] = useState(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('vsms_v4_clean')) {
      localStorage.removeItem('vsms_visitors');
      localStorage.removeItem('vsms_sqlite_db_bin');
      localStorage.setItem('vsms_theme', 'light');
      localStorage.setItem('vsms_v4_clean', 'true');
      return [];
    }
    const saved = localStorage.getItem('vsms_visitors');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return sanitizeVisitorList(parsed);
      } catch (e) { console.error(e); }
    }
    return sanitizeVisitorList(INITIAL_VISITORS);
  });

  // Sync SQLite schema, fields, and visitors when active organization or DB changes
  useEffect(() => {
    sqliteService.initPromise.then(() => {
      // 1. Load Org Dynamic Fields
      const dbFields = sqliteService.getOrganizationFields(currentOrgId);
      if (dbFields && dbFields.length > 0) {
        setOrgFields(dbFields);
      }

      // 2. Load Visitors scoped to current organization
      const dbVisitors = sqliteService.getAllVisitors(currentOrgId);
      const cleanDbVisitors = sanitizeVisitorList(dbVisitors);
      setVisitors(cleanDbVisitors);

      // 3. Load Departments & Hosts
      const dbDepts = sqliteService.getDepartments(currentOrgId);
      if (dbDepts && dbDepts.length > 0) setDepartments(dbDepts);

      const dbHosts = sqliteService.getHosts(currentOrgId);
      if (dbHosts && dbHosts.length > 0) setHosts(dbHosts);
    });
  }, [currentOrgId]);

  // Derived: Fixed table display slots (strictly capped at max 5)
  const tableDisplayFields = useMemo(() => {
    const active = orgFields.filter(f => Number(f.show_in_table) === 1);
    return active.slice(0, 5);
  }, [orgFields]);

  // Derived: Badge display fields
  const badgeDisplayFields = useMemo(() => {
    return orgFields.filter(f => Number(f.show_on_badge) === 1);
  }, [orgFields]);

  // Update Org Fields with 5-slot constraint guardrail
  const updateOrgFields = (newFields) => {
    // Count table display slots
    const tableSlotCount = newFields.filter(f => Number(f.show_in_table) === 1).length;
    if (tableSlotCount > 5) {
      throw new Error('Table slots capped: A maximum of 5 fields can be displayed in summary tables.');
    }

    sqliteService.saveOrganizationFields(currentOrgId, newFields);
    setOrgFields(newFields);
    return newFields;
  };

  // LocalStorage state for light theme
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('vsms_theme_v4_light')) {
      localStorage.setItem('vsms_theme', 'light');
      localStorage.setItem('vsms_theme_v4_light', 'true');
      return 'light';
    }
    return localStorage.getItem('vsms_theme') || 'light';
  });

  // User Role (synced with AuthContext)
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('vsms_role') || authRole || 'admin';
  });

  useEffect(() => {
    if (authRole) setUserRole(authRole);
  }, [authRole]);

  // Active View: 'live' | 'log' | 'analytics' | 'departments' | 'settings'
  const [activeView, setActiveView] = useState('live');

  // Modals & Panels
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState(null);
  
  // Visitor Full Details Drawer
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedVisitorForDetails, setSelectedVisitorForDetails] = useState(null);

  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vsms_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
      return window.innerWidth < 1024;
    }
    return false;
  });

  const [hasManuallyToggledSidebar, setHasManuallyToggledSidebar] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!hasManuallyToggledSidebar && typeof window !== 'undefined') {
        if (window.innerWidth < 1024 && window.innerWidth >= 768) {
          setIsSidebarCollapsed(true);
        } else if (window.innerWidth >= 1024) {
          setIsSidebarCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasManuallyToggledSidebar]);

  useEffect(() => {
    localStorage.setItem('vsms_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  const toggleSidebarCollapse = () => {
    setHasManuallyToggledSidebar(true);
    setIsSidebarCollapsed(prev => !prev);
  };

  // Search & Filter Global State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Save visitors to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('vsms_visitors', JSON.stringify(visitors));
  }, [visitors]);

  // Sync theme
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

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
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
        setIsDetailsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action: Register New Visitor (Dynamic Custom Fields + Baseline Fields)
  const registerVisitor = (formData) => {
    const newId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingMaxBadge = visitors.reduce((max, v) => {
      const num = parseInt(v.badgeId?.replace(/^BDG-/, '') || '0', 10);
      return num > max ? num : max;
    }, 80);
    const badgeId = `BDG-${String(existingMaxBadge + 1).padStart(3, '0')}`;

    // Package dynamic custom attributes
    const customData = { ...formData };
    delete customData.fullName;
    delete customData.phone;

    // Resolve host and department if host_picker was used
    let resolvedHost = formData.hostName || formData.host || '';
    let resolvedDept = formData.department || '';
    if (formData.host) {
      const hostObj = hosts.find(h => h.name === formData.host || h.id === formData.host);
      if (hostObj) {
        resolvedHost = hostObj.name;
        if (!resolvedDept && hostObj.deptId) {
          const deptObj = departments.find(d => d.id === hostObj.deptId || d.code === hostObj.deptId);
          if (deptObj) resolvedDept = deptObj.name;
        }
      }
    }

    const newVisitor = {
      id: newId,
      org_id: currentOrgId,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || '',
      company: formData.company || '',
      idType: formData.idType || '',
      idNumber: formData.idNumber || '',
      hostName: resolvedHost,
      department: resolvedDept,
      purpose: formData.purpose || 'Official Visit',
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      status: 'Checked-In',
      badgeId: badgeId,
      expectedDurationMinutes: parseInt(formData.expectedDurationMinutes || '60', 10) || 60,
      vehiclePlate: formData.vehiclePlate || '',
      notes: formData.notes || '',
      avatar: formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName)}&backgroundColor=171717,262626,404040,737373&textColor=ffffff`,
      custom_data: customData,
      custom_data_json: JSON.stringify(customData)
    };

    // Save in SQLite DB
    sqliteService.insertVisitor(newVisitor);

    setVisitors(prev => [newVisitor, ...prev]);
    setIsCheckInOpen(false);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']
      });
    } catch (e) {
      // Ignored
    }

    // Auto open badge
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

  // Action: Open Details Drawer
  const openDetailsDrawer = (visitor) => {
    setSelectedVisitorForDetails(visitor);
    setIsDetailsDrawerOpen(true);
  };

  // Action: Reset Data
  const resetToDemoData = () => {
    sqliteService.resetDatabase();
    const freshVisitors = sqliteService.getAllVisitors(currentOrgId);
    setVisitors(freshVisitors);
    const freshFields = sqliteService.getOrganizationFields(currentOrgId);
    setOrgFields(freshFields);
    localStorage.removeItem('vsms_visitors');
  };

  // Helper: Export to CSV (Includes standard columns + dynamic custom attributes)
  const exportToCSV = () => {
    const standardKeys = new Set(['fullName', 'phone', 'email', 'company', 'idType', 'idNumber', 'host', 'hostName', 'department', 'purpose']);
    const extraCustomFields = orgFields.filter(f => !standardKeys.has(f.field_key));
    const extraHeaders = extraCustomFields.map(f => f.field_name);

    const headers = ['Visitor ID', 'Full Name', 'Phone', 'Email', 'Company', 'ID Type', 'ID Number', 'Host', 'Department', 'Purpose', ...extraHeaders, 'Check-In', 'Check-Out', 'Status', 'Badge ID'];
    const rows = visitors.map(v => {
      const extraValues = extraCustomFields.map(f => {
        const val = v[f.field_key] !== undefined ? v[f.field_key] : (v.custom_data?.[f.field_key] ?? '');
        return `"${String(val || '').replace(/"/g, '""')}"`;
      });

      return [
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
        ...extraValues,
        `"${new Date(v.checkInTime).toLocaleString()}"`,
        v.checkOutTime ? `"${new Date(v.checkOutTime).toLocaleString()}"` : 'On-Premises',
        v.status,
        v.badgeId
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentOrg?.slug || 'VSMS'}_Visitor_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <VisitorContext.Provider value={{
      visitors,
      orgFields,
      updateOrgFields,
      tableDisplayFields,
      badgeDisplayFields,
      departments,
      hosts,
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
      isDetailsDrawerOpen,
      setIsDetailsDrawerOpen,
      selectedVisitorForDetails,
      setSelectedVisitorForDetails,
      openDetailsDrawer,
      isCmdKOpen,
      setIsCmdKOpen,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebarCollapse,
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
