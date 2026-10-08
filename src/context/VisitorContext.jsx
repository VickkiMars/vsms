import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_VISITORS, DEPARTMENTS, HOSTS } from '../data/initialData';
import { supabaseService, DEFAULT_ORG_FIELDS } from '../db/supabaseService';
import { useAuthContext } from './AuthContext';
import { audioAlertService } from '../services/audioAlertService';
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
  const currentOrgId = currentOrg?.id || '';

  // Dynamic Organization Fields
  const [orgFields, setOrgFields] = useState(DEFAULT_ORG_FIELDS);
  // True once Supabase has returned real fields (guards the check-in modal)
  const [isFieldsReady, setIsFieldsReady] = useState(false);

  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [hosts, setHosts] = useState(HOSTS);
  const [visitors, setVisitors] = useState([]);

  // Load all org data from Supabase whenever the active org changes
  useEffect(() => {
    if (!currentOrgId) {
      setIsFieldsReady(true); // no org yet — unblock the UI
      return;
    }

    supabaseService.initPromise.then(async () => {
      // 1. Fields
      const dbFields = await supabaseService.getOrganizationFields(currentOrgId);
      setOrgFields(dbFields && dbFields.length > 0 ? dbFields : DEFAULT_ORG_FIELDS);

      // 2. Visitors
      const dbVisitors = await supabaseService.getAllVisitors(currentOrgId);
      setVisitors(sanitizeVisitorList(dbVisitors));

      // 3. Departments & Hosts
      const dbDepts = await supabaseService.getDepartments(currentOrgId);
      if (dbDepts && dbDepts.length > 0) setDepartments(dbDepts);

      const dbHosts = await supabaseService.getHosts(currentOrgId);
      if (dbHosts && dbHosts.length > 0) setHosts(dbHosts);

      setIsFieldsReady(true);
    });
  }, [currentOrgId]);

  // Derived: table display fields (capped at 5)
  const tableDisplayFields = useMemo(() => {
    const active = orgFields.filter(f => Number(f.show_in_table) === 1);
    return active.slice(0, 5);
  }, [orgFields]);

  // Derived: badge display fields
  const badgeDisplayFields = useMemo(() => {
    return orgFields.filter(f => Number(f.show_on_badge) === 1);
  }, [orgFields]);

  // Update org fields (with 5-slot guardrail) — writes to Supabase
  const updateOrgFields = async (newFields) => {
    const tableSlotCount = newFields.filter(f => Number(f.show_in_table) === 1).length;
    if (tableSlotCount > 5) {
      throw new Error('Table slots capped: A maximum of 5 fields can be displayed in summary tables.');
    }
    await supabaseService.saveOrganizationFields(currentOrgId, newFields);
    setOrgFields(newFields);
    return newFields;
  };

  // Theme
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('vsms_theme_v4_light')) {
      localStorage.setItem('vsms_theme', 'light');
      localStorage.setItem('vsms_theme_v4_light', 'true');
      return 'light';
    }
    return localStorage.getItem('vsms_theme') || 'light';
  });

  // User role (synced with AuthContext)
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('vsms_role') || authRole || 'admin';
  });

  useEffect(() => {
    if (authRole) setUserRole(authRole);
  }, [authRole]);

  const [activeView, setActiveView] = useState('live');

  // Modals & Panels
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState(null);
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

  // Search & Filter
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

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

  // Sync role
  useEffect(() => {
    localStorage.setItem('vsms_role', userRole);
  }, [userRole]);

  // Keyboard shortcuts
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

  // Desk Audio Alert State (persisted via audioAlertService)
  const [isAudioMuted, setIsAudioMuted] = useState(() => audioAlertService.isMuted());
  const [acknowledgedOverstayIds, setAcknowledgedOverstayIds] = useState(new Set());

  const toggleAudioMute = () => {
    const nextMuted = audioAlertService.toggleMute();
    setIsAudioMuted(nextMuted);
    return nextMuted;
  };

  const testAlertSound = () => {
    audioAlertService.playOverstayChime();
  };

  const acknowledgeOverstay = (visitorId) => {
    audioAlertService.acknowledgeAlert(visitorId);
    setAcknowledgedOverstayIds(prev => new Set([...prev, visitorId]));
  };

  // Overstay Surveillance Ticker (runs every 10 seconds)
  useEffect(() => {
    const checkOverstays = () => {
      const nowTime = Date.now();
      let stateChanged = false;
      const newlyOverdue = [];

      setVisitors(prevVisitors => {
        if (!Array.isArray(prevVisitors) || prevVisitors.length === 0) return prevVisitors;

        const next = prevVisitors.map(v => {
          if (!v || v.status === 'Checked-Out') return v;
          const checkIn = new Date(v.checkInTime).getTime();
          if (isNaN(checkIn)) return v;

          const durationMins = parseInt(v.expectedDurationMinutes, 10) || 60;
          const maxAllowedMs = durationMins * 60 * 1000;
          const isPastDue = (nowTime - checkIn) > maxAllowedMs;

          if (isPastDue) {
            if (v.status !== 'Overdue') {
              stateChanged = true;
              supabaseService.updateVisitorStatus(v.id, 'Overdue');
              newlyOverdue.push(v);
              return { ...v, status: 'Overdue' };
            } else if (audioAlertService.canAlertVisitor(v.id)) {
              newlyOverdue.push(v);
            }
          }
          return v;
        });

        return stateChanged ? next : prevVisitors;
      });

      if (newlyOverdue.length > 0) {
        audioAlertService.playOverstayChime();
        newlyOverdue.forEach(v => audioAlertService.recordAlert(v.id));
      }
    };

    // Run initial scan then periodic 10s checks
    checkOverstays();
    const timer = setInterval(checkOverstays, 10000);
    return () => clearInterval(timer);
  }, []);

  // Register new visitor — writes to Supabase
  const registerVisitor = async (formData) => {
    const newId = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingMaxBadge = visitors.reduce((max, v) => {
      const num = parseInt(v.badgeId?.replace(/^BDG-/, '') || '0', 10);
      return num > max ? num : max;
    }, 80);
    const badgeId = `BDG-${String(existingMaxBadge + 1).padStart(3, '0')}`;

    const customData = { ...formData };
    delete customData.fullName;
    delete customData.phone;

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
      custom_data_json: customData,
    };

    // Optimistic UI update first, then persist to Supabase
    setVisitors(prev => [newVisitor, ...prev]);
    setIsCheckInOpen(false);

    await supabaseService.insertVisitor(newVisitor);

    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#000000', '#ffffff', '#737373', '#d4d4d4', '#262626']
      });
    } catch (e) { /* ignored */ }

    setSelectedVisitorForBadge(newVisitor);
    setIsBadgeModalOpen(true);
    return newVisitor;
  };

  // Check out visitor — writes to Supabase
  const checkOutVisitor = async (visitorId) => {
    const nowIso = new Date().toISOString();
    audioAlertService.clearAcknowledgment(visitorId);
    setAcknowledgedOverstayIds(prev => {
      const next = new Set(prev);
      next.delete(visitorId);
      return next;
    });
    // Optimistic update
    setVisitors(prev => prev.map(v =>
      v.id === visitorId ? { ...v, checkOutTime: nowIso, status: 'Checked-Out' } : v
    ));
    await supabaseService.updateVisitorStatus(visitorId, 'Checked-Out', nowIso);
  };

  const openBadgeModal = (visitor) => {
    setSelectedVisitorForBadge(visitor);
    setIsBadgeModalOpen(true);
  };

  const openDetailsDrawer = (visitor) => {
    setSelectedVisitorForDetails(visitor);
    setIsDetailsDrawerOpen(true);
  };

  // Reset data — deletes org data from Supabase then reloads
  const resetToDemoData = async () => {
    await supabaseService.resetDatabase(currentOrgId);
    const freshVisitors = await supabaseService.getAllVisitors(currentOrgId);
    setVisitors(sanitizeVisitorList(freshVisitors));
    const freshFields = await supabaseService.getOrganizationFields(currentOrgId);
    setOrgFields(freshFields && freshFields.length > 0 ? freshFields : DEFAULT_ORG_FIELDS);
  };

  // CSV export
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
      setOrgFields,
      updateOrgFields,
      isFieldsReady,
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
      isAudioMuted,
      toggleAudioMute,
      testAlertSound,
      acknowledgeOverstay,
      acknowledgedOverstayIds,
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitorContext = () => useContext(VisitorContext);
