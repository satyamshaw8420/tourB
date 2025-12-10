import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserTie } from 'react-icons/fa'; // Added FaUserTie for guide icon
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth'; // Import the new auth hook

const PremiumHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Use the new auth hook
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGuideDropdownOpen, setIsGuideDropdownOpen] = useState(false); // Added state for guide dropdown

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Create Trip', path: '/create-trip' },
    { name: 'My Trip', path: '/trip-history' },
    { name: 'Destination', path: '/globe' },
    { name: 'Compare', path: '/compare' },
    { name: 'Offline', path: '/offline' },
    { name: 'Weather', path: '/weather' },
    { name: 'Community', path: '/social' },
    // Guide option will be added separately as a dropdown
  ];

  // Function to trigger Google Sign-In
  const handleGoogleSignIn = () => {
    // Navigate to the dedicated sign-up page
    navigate('/sign-up');
  };

  // Handle logout
  const handleLogout = () => {
    logout(); // Use the logout function from the hook
    toast.success("You have been logged out successfully. All user data cleared.");
    navigate('/');
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
              <img src="/travelease logo.png" alt="TravelEase Logo" className="h-25 w-auto" />
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
            
            {/* Guide Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsGuideDropdownOpen(!isGuideDropdownOpen)}
                className="text-white !text-white font-medium hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0 whitespace-nowrap flex items-center"
              >
                <FaUserTie className="mr-1" /> Guide
              </button>
              
              {isGuideDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsGuideDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Be a Traveller
                  </button>
                  <button
                    onClick={() => {
                      navigate('/guide');
                      setIsGuideDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Be a Guide
                  </button>
                </div>
              )}
            </div>
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
            
            {/* Mobile Guide Options */}
            <div className="pt-2">
              <div className="text-white font-medium py-2">Guide Options</div>
              <button
                onClick={() => {
                  navigate('/');
                  setIsMenuOpen(false);
                }}
                className="text-left text-white !text-white font-medium py-2 pl-4 hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0"
              >
                Be a Traveller
              </button>
              <button
                onClick={() => {
                  navigate('/guide');
                  setIsMenuOpen(false);
                }}
                className="text-left text-white !text-white font-medium py-2 pl-4 hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0"
              >
                Be a Guide
              </button>
            </div>
            
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