import React, { createContext, useContext, useState, useEffect } from 'react';
import { sqliteService, SEED_USERS, SEED_ORGS, DEFAULT_ORG_FIELDS } from '../db/sqliteDb';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState(SEED_ORGS);
  const [currentOrg, setCurrentOrg] = useState(() => {
    const savedOrg = typeof window !== 'undefined' ? localStorage.getItem('vsms_active_org') : null;
    if (savedOrg) {
      try {
        const parsed = JSON.parse(savedOrg);
        if (parsed && parsed.id && parsed.id !== 'ORG-DEMO-01' && parsed.slug !== 'apex-global') {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return null;
  });

  const [users, setUsers] = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vsms_active_user') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SEED_USERS[0]; // Default to Admin
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOrgWizardOpen, setIsOrgWizardOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  // Synchronize organizations, users and current session with SQLite DB
  useEffect(() => {
    sqliteService.initPromise.then(() => {
      const dbOrgs = sqliteService.getAllOrganizations();
      if (dbOrgs && dbOrgs.length > 0) {
        setOrganizations(dbOrgs);
        // Validate currentOrg is still valid
        const found = dbOrgs.find(o => o.id === currentOrg?.id);
        if (found) {
          setCurrentOrg(found);
        } else if (!currentOrg) {
          setCurrentOrg(dbOrgs[0]);
        }
      } else {
        setOrganizations([]);
        setCurrentOrg(null);
        // Landing page handles the no-org state; wizard opens via CTA
      }

      const dbUsers = sqliteService.getAllUsers();
      if (dbUsers && dbUsers.length > 0) {
        setUsers(dbUsers);
      }
    });
  }, []);

  useEffect(() => {
    if (currentOrg) {
      localStorage.setItem('vsms_active_org', JSON.stringify(currentOrg));
    } else {
      localStorage.removeItem('vsms_active_org');
    }
  }, [currentOrg]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vsms_active_user', JSON.stringify(currentUser));
      localStorage.setItem('vsms_role', currentUser.role);
    } else {
      localStorage.removeItem('vsms_active_user');
    }
  }, [currentUser]);

  // Direct email login with automated organization detection
  const login = (email, password) => {
    setAuthError('');
    const dbUsers = sqliteService.getAllUsers();
    const user = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      setAuthError('No account found with this email address.');
      return false;
    }

    if (user.password_hash !== password) {
      setAuthError('Incorrect password. Please verify and try again.');
      return false;
    }

    // Auto-detect and switch to user's assigned organization
    if (user.org_id) {
      const org = sqliteService.getOrganization(user.org_id);
      if (org) {
        setCurrentOrg(org);
      }
    }

    const updatedUser = {
      ...user,
      last_login: new Date().toISOString()
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('vsms_role', updatedUser.role);
    sqliteService.logAction(
      updatedUser.id,
      updatedUser.fullName,
      'USER_LOGIN',
      `User ${updatedUser.email} authenticated successfully as ${updatedUser.role}.`,
      user.org_id || currentOrg?.id
    );
    setIsLoginModalOpen(false);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      sqliteService.logAction(
        currentUser.id,
        currentUser.fullName,
        'USER_LOGOUT',
        `User ${currentUser.email} logged out.`,
        currentOrg?.id
      );
    }
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // Switch organization (for demo or testing)
  const switchOrganization = (orgId) => {
    const org = sqliteService.getOrganization(orgId);
    if (!org) return;
    setCurrentOrg(org);

    // Pick first admin or user of that organization
    const orgUsers = sqliteService.getAllUsers(org.id);
    const targetUser = orgUsers.find(u => u.role === 'admin') || orgUsers[0] || {
      id: `USR-ADMIN-${org.id}`,
      org_id: org.id,
      email: `admin@${org.slug}.com`,
      fullName: `${org.name} Administrator`,
      role: 'admin',
      desk_location: 'Executive Office',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(org.name)}`
    };

    setCurrentUser(targetUser);
    localStorage.setItem('vsms_role', targetUser.role);
    sqliteService.logAction(
      targetUser.id,
      targetUser.fullName,
      'ORG_SWITCH',
      `Switched active organization to ${org.name} (${org.id})`,
      org.id
    );
  };

  const switchUserRole = (roleName) => {
    const orgId = currentOrg?.id || '';
    const orgUsers = sqliteService.getAllUsers(orgId);
    const targetUser = orgUsers.find(u => u.role === roleName) || {
      id: `USR-TMP-${roleName}`,
      org_id: orgId,
      email: `${roleName}@${currentOrg?.slug || 'vsms'}.com`,
      fullName: `${roleName === 'reception' ? 'Front Desk Receptionist' : roleName.toUpperCase() + ' Officer'}`,
      role: roleName,
      desk_location: roleName === 'reception' ? 'Main Lobby - Desk A' : 'Security Desk',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${roleName}`
    };
    setCurrentUser(targetUser);
    localStorage.setItem('vsms_role', roleName);
    sqliteService.logAction(
      targetUser.id,
      targetUser.fullName,
      'ROLE_SWITCH',
      `Switched active role to ${roleName}`,
      orgId
    );
  };

  // Onboard new organization via Guided 3-Step Setup Wizard
  const createOrganizationWithAdmin = ({
    orgName,
    slug,
    industry,
    contactEmail,
    logoUrl,
    adminFullName,
    adminEmail,
    adminPassword,
    deskLocation,
    fields,
    receptionists = []
  }) => {
    const orgId = `ORG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const cleanSlug = slug || orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const newOrg = {
      id: orgId,
      name: orgName,
      slug: cleanSlug,
      industry: industry || 'Enterprise Services',
      contact_email: contactEmail,
      logo_url: logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(orgName)}`,
      created_at: new Date().toISOString()
    };

    // 1. Save Organization
    sqliteService.insertOrganization(newOrg);

    // 2. Save Dynamic Form Fields
    if (fields && fields.length > 0) {
      sqliteService.saveOrganizationFields(orgId, fields);
    } else {
      sqliteService.initializeOrgFields(orgId, DEFAULT_ORG_FIELDS);
    }

    // 3. Create Org Admin User
    const adminUser = {
      id: `USR-ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      org_id: orgId,
      email: adminEmail,
      password_hash: adminPassword || 'admin123',
      fullName: adminFullName,
      role: 'admin',
      desk_location: deskLocation || 'HQ Security Administration',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(adminFullName)}`,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    sqliteService.insertUser(adminUser);

    // 4. Create Initial Receptionists if provisioned in Step 3
    if (receptionists && receptionists.length > 0) {
      receptionists.forEach((rec, idx) => {
        if (!rec.email || !rec.fullName) return;
        const recUser = {
          id: `USR-REC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          org_id: orgId,
          email: rec.email,
          password_hash: rec.password || 'reception123',
          fullName: rec.fullName,
          role: 'reception',
          desk_location: rec.deskLocation || `Front Desk ${idx + 1}`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rec.fullName)}`,
          created_at: new Date().toISOString(),
          last_login: null
        };
        sqliteService.insertUser(recUser);
      });
    }

    // Refresh state
    const allOrgs = sqliteService.getAllOrganizations();
    setOrganizations(allOrgs);
    setUsers(sqliteService.getAllUsers());

    // Switch active context to the new organization and admin user
    setCurrentOrg(newOrg);
    setCurrentUser(adminUser);

    sqliteService.logAction(
      adminUser.id,
      adminUser.fullName,
      'ORG_ONBOARDING',
      `Onboarded new organization: ${newOrg.name} with ${fields?.length || 0} fields and ${receptionists?.length || 0} receptionists.`,
      orgId
    );

    return newOrg;
  };

  // Provision new Receptionist / Staff Account (Admin Console)
  const provisionReceptionist = ({ fullName, email, password, deskLocation }) => {
    const orgId = currentOrg?.id || '';
    const newStaff = {
      id: `USR-REC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      org_id: orgId,
      email: email.trim(),
      password_hash: password || 'reception123',
      fullName: fullName.trim(),
      role: 'reception',
      desk_location: deskLocation || 'Main Reception Desk',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString(),
      last_login: null
    };

    sqliteService.insertUser(newStaff);
    const updatedUsers = sqliteService.getAllUsers();
    setUsers(updatedUsers);

    sqliteService.logAction(
      currentUser?.id || 'SYS',
      currentUser?.fullName || 'Administrator',
      'CREATE_RECEPTIONIST',
      `Provisioned receptionist account: ${newStaff.fullName} (${newStaff.email}) at ${newStaff.desk_location}`,
      orgId
    );

    return newStaff;
  };

  const createNewUser = (userData) => {
    const orgId = currentOrg?.id || '';
    const newUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      org_id: orgId,
      email: userData.email,
      password_hash: userData.password || 'password123',
      fullName: userData.fullName,
      role: userData.role || 'security',
      desk_location: userData.deskLocation || 'Security Desk',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
      created_at: new Date().toISOString(),
      last_login: null
    };

    sqliteService.insertUser(newUser);
    setUsers(sqliteService.getAllUsers());
    sqliteService.logAction(
      currentUser?.id || 'SYS',
      currentUser?.fullName || 'System',
      'CREATE_USER',
      `Created new user account: ${newUser.email} (${newUser.role})`,
      orgId
    );
    return newUser;
  };

  const changeUserPassword = (userId, newPassword) => {
    sqliteService.updateUserPassword(userId, newPassword);
    setUsers(sqliteService.getAllUsers());
    sqliteService.logAction(
      currentUser?.id || 'SYS',
      currentUser?.fullName || 'System',
      'UPDATE_PASSWORD',
      `Updated password for user ID ${userId}`,
      currentOrg?.id
    );
  };

  return (
    <AuthContext.Provider value={{
      organizations,
      currentOrg,
      setCurrentOrg,
      switchOrganization,
      createOrganizationWithAdmin,
      provisionReceptionist,
      currentUser,
      users,
      isAuthenticated: !!currentUser,
      userRole: currentUser?.role || 'admin',
      isLoginModalOpen,
      setIsLoginModalOpen,
      isOrgWizardOpen,
      setIsOrgWizardOpen,
      authError,
      setAuthError,
      login,
      logout,
      switchUserRole,
      createNewUser,
      changeUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
