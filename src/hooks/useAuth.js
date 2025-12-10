import { useState, useEffect } from 'react';
import { clearAllUserData } from '@/utils/dataCleanup';

// Custom hook for managing authentication state
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkUserStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Check user status on mount
    checkUserStatus();

    // Listen for storage changes (logout from other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUserStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom logout events
    const handleLogoutEvent = () => {
      checkUserStatus();
    };
    
    window.addEventListener('user-logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-logout', handleLogoutEvent);
    };
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      newValue: JSON.stringify(userData)
    }));
  };

  // Logout function
  const logout = () => {
    // Clear all user-related data using utility function
    clearAllUserData();
    
    // Clear user state
    setUser(null);
    
    // Remove user from localStorage
    localStorage.removeItem('user');
    
    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      newValue: null
    }));
    
    // Dispatch custom logout event
    window.dispatchEvent(new CustomEvent('user-logout'));
  };

  return {
    user,
    loading,
    login,
    logout
  };
};