import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const normalizeAccounts = (accounts = []) => {
  return accounts
    .filter((account) => account?.vpa)
    .map((account, index) => ({
      ...account,
      id: String(account.id || account.account_id || account.vpa || `acc-${index + 1}`),
      name: account.name || account.account_name || `Account ${index + 1}`,
    }));
};

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;

  const accountsFromPayload = Array.isArray(rawUser.accounts)
    ? normalizeAccounts(rawUser.accounts)
    : [];

  const legacyAccount = rawUser.vpa
    ? normalizeAccounts([{
        id: 'primary',
        name: 'Primary Account',
        vpa: rawUser.vpa,
      }])
    : [];

  const accounts = accountsFromPayload.length > 0 ? accountsFromPayload : legacyAccount;

  return {
    ...rawUser,
    accounts,
    activeAccountId: rawUser.activeAccountId || accounts[0]?.id || null,
  };
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, isSetAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'user' or 'admin'

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedUser) {
      try {
        const parsedUser = normalizeUser(JSON.parse(storedUser));
        setUser(parsedUser);
        isSetAuthenticated(true);
        setUserRole(storedRole || 'user');
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, role = 'user') => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    isSetAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('userRole', role);
  };

  const setActiveAccount = (accountId) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const hasAccount = (prevUser.accounts || []).some(
        (account) => String(account.id) === String(accountId)
      );
      if (!hasAccount) return prevUser;

      const updatedUser = {
        ...prevUser,
        activeAccountId: String(accountId),
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const addAccount = (accountData) => {
    if (!accountData?.vpa) return;

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const normalizedAccount = normalizeAccounts([accountData])[0];
      const existingAccounts = Array.isArray(prevUser.accounts) ? prevUser.accounts : [];
      const duplicate = existingAccounts.some(
        (account) => account.vpa === normalizedAccount.vpa || String(account.id) === String(normalizedAccount.id)
      );

      if (duplicate) {
        return prevUser;
      }

      const updatedUser = {
        ...prevUser,
        accounts: [...existingAccounts, normalizedAccount],
        activeAccountId: normalizedAccount.id,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    isSetAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    userRole,
    login,
    logout,
    setActiveAccount,
    addAccount,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
