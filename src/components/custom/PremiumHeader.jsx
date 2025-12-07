import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { clearAllUserData } from '@/utils/dataCleanup';

const PremiumHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Create Trip', path: '/create-trip' },
    { name: 'My Trip', path: '/trip-history' },
    { name: 'Destination', path: '/globe' },
    { name: 'Compare', path: '/compare' },
    { name: 'Offline', path: '/offline' },
    { name: 'Weather', path: '/weather' },
    { name: 'Community', path: '/social' },
  ];

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Comprehensive logout function that clears all user data
  const handleLogout = () => {
    // Clear all user-related data using utility function
    clearAllUserData();
    
    // Clear user state
    setUser(null);
    
    // Show success message
    toast.success("You have been logged out successfully. All user data cleared.");
    
    // Navigate to home page
    navigate('/');
  };

  // Function to trigger Google Sign-In
  const handleGoogleSignIn = () => {
    // Navigate to the dedicated sign-up page
    navigate('/sign-up');
  };

  return (
    <header className="sticky top-0 z-50 bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div 
              className="flex items-center"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <img src="/logo.svg" alt="TravelEase Logo" className="h-8 w-auto" />
            </div>
          </div>

          {/* Desktop Navigation - Text only links */}
          <nav className="hidden md:flex md:space-x-4 lg:space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`text-white !text-white font-medium hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0 whitespace-nowrap ${
                  location.pathname === item.path 
                    ? 'font-medium text-blue-400 underline' 
                    : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Right side - Authentication */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              // User is logged in - show logout button only
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLogout}
                  className="text-white bg-transparent border border-white px-2 py-1 rounded text-xs hover:bg-white hover:text-black transition-colors duration-300 flex items-center whitespace-nowrap"
                >
                  <span className="mr-1">←</span> 
                  <span className="hidden lg:inline">Logout</span>
                  <span className="lg:hidden">Out</span>
                </button>
              </div>
            ) : (
              // User is not logged in - hide login/signup buttons
              <div>
                {/* Login and Sign Up buttons removed as per user request */}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-400 focus:outline-none focus:ring-0 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <span className="text-2xl !text-white">×</span>
              ) : (
                <span className="text-2xl !text-white">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Text only links */}
      {isMenuOpen && (
        <div className="md:hidden bg-black px-4 pb-4">
          <div className="flex flex-col space-y-3 pt-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`text-left text-white !text-white font-medium py-2 hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0 ${
                  location.pathname === item.path 
                    ? 'font-medium text-blue-400 underline' 
                    : ''
                }`}
              >
                {item.name}
              </button>
            ))}
            {/* Mobile Authentication Section */}
            <div className="flex space-x-2 pt-2">
              {user ? (
                // User is logged in - show logout button only
                <div className="flex flex-col space-y-2 w-full">
                  <button
                    onClick={handleLogout}
                    className="text-white bg-transparent border border-white px-4 py-1 rounded text-sm hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center"
                  >
                    <span className="mr-1">←</span> Logout
                  </button>
                </div>
              ) : (
                // User is not logged in
                <div className="flex flex-col space-y-2 w-full">
                  {/* Login and Sign Up buttons removed as per user request */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PremiumHeader;