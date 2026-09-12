import React, { createContext, useContext, useState, useEffect } from 'react';
import { sqliteService, SEED_USERS } from '../db/sqliteDb';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vsms_active_user') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SEED_USERS[0]; // Default to Admin
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  // Synchronize users and current session with SQLite DB
  useEffect(() => {
    sqliteService.initPromise.then(() => {
      const dbUsers = sqliteService.getAllUsers();
      if (dbUsers && dbUsers.length > 0) {
        setUsers(dbUsers);
      }
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vsms_active_user', JSON.stringify(currentUser));
      localStorage.setItem('vsms_role', currentUser.role);
    } else {
      localStorage.removeItem('vsms_active_user');
    }
  }, [currentUser]);

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

    const updatedUser = {
      ...user,
      last_login: new Date().toISOString()
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('vsms_role', updatedUser.role);
    sqliteService.logAction(updatedUser.id, updatedUser.fullName, 'USER_LOGIN', `User ${updatedUser.email} authenticated successfully.`);
    setIsLoginModalOpen(false);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      sqliteService.logAction(currentUser.id, currentUser.fullName, 'USER_LOGOUT', `User ${currentUser.email} logged out.`);
    }
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  const switchUserRole = (roleName) => {
    const dbUsers = sqliteService.getAllUsers();
    const targetUser = dbUsers.find(u => u.role === roleName) || {
      id: `USR-TMP-${roleName}`,
      email: `${roleName}@vsms.com`,
      fullName: `${roleName.toUpperCase()} Officer`,
      role: roleName,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + roleName
    };
    setCurrentUser(targetUser);
    localStorage.setItem('vsms_role', roleName);
    sqliteService.logAction(targetUser.id, targetUser.fullName, 'ROLE_SWITCH', `Switched active role to ${roleName}`);
  };

  const createNewUser = (userData) => {
    const newUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      email: userData.email,
      password_hash: userData.password || 'password123',
      fullName: userData.fullName,
      role: userData.role || 'security',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName)}`,
      created_at: new Date().toISOString(),
      last_login: null
    };

    sqliteService.insertUser(newUser);
    setUsers(sqliteService.getAllUsers());
    sqliteService.logAction(currentUser?.id || 'SYS', currentUser?.fullName || 'System', 'CREATE_USER', `Created new user account: ${newUser.email} (${newUser.role})`);
    return newUser;
  };

  const changeUserPassword = (userId, newPassword) => {
    sqliteService.updateUserPassword(userId, newPassword);
    setUsers(sqliteService.getAllUsers());
    sqliteService.logAction(currentUser?.id || 'SYS', currentUser?.fullName || 'System', 'UPDATE_PASSWORD', `Updated password for user ID ${userId}`);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      isAuthenticated: !!currentUser,
      userRole: currentUser?.role || 'admin',
      isLoginModalOpen,
      setIsLoginModalOpen,
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
