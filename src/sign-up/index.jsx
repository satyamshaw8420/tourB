import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { clearStaleOAuthData } from '@/utils/dataCleanup';
// Removed particle system due to import issues
// import Particles from '@tsparticles/react';
// import { tsParticles } from '@tsparticles/engine';
// import { loadFull } from '@tsparticles/react';

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.email && parsedUser._id) {
            // User is already authenticated, redirect to home
            setIsAuthenticated(true);
            toast.info("You're already signed in. Redirecting to homepage...");
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            // Malformed user data, clear it
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear any corrupted data
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Clear any existing Google OAuth data before initiating new login
  const clearGoogleOAuthData = () => {
    // Use the utility function to clear stale OAuth data
    clearStaleOAuthData();
  };

  // Google Login Hook with enhanced options
  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log("Google Sign-In Success:", codeResp);
      // Get user profile information first
      GetUserProfile({ access_token: codeResp.access_token });
    },
    onError: (error) => {
      console.log("Google Sign-In Error:", error);
      toast.error("Google Sign-In failed. Please try again.");
    },
    scope: 'openid profile email',
    prompt: 'select_account',
    // Force re-authentication
    auth_type: 'reauthenticate',
    // Include additional parameters to bypass cache
    include_granted_scopes: true
  });

  // Function to get user profile after Google login
  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    })
      .then((resp) => {
        console.log("Full User Profile Response:", resp);
        console.log("User Data:", resp.data);
        
        // Format user data to match the expected structure
        const formattedUserData = {
          success: true,
          _id: resp.data.id || 'google-user',
          fullname: resp.data.name || 'Google User',
          username: resp.data.email?.split('@')[0] || 'google_user',
          email: resp.data.email || '',
          gender: 'not specified',
          profilepic: resp.data.picture || 'https://avatar.iran.liara.run/public/boy?username=google',
          message: "Successfully Signed Up"
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(formattedUserData));
        console.log("User data stored in localStorage:", formattedUserData);
        
        // Show success message
        toast.success("Welcome! You've been successfully signed up.");
        
        // Redirect to homepage after successful sign-up
        setTimeout(() => {
          navigate('/');
        }, 1000);
      })
      .catch(error => {
        console.log("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile. Please try again.");
      });
  };

  // Auto-trigger Google Sign-In when component mounts (only if not authenticated)
  useEffect(() => {
    // Don't auto-trigger if still checking auth status or if already authenticated
    if (isLoading || isAuthenticated) {
      return;
    }

    // Clear any existing OAuth data
    clearGoogleOAuthData();
    
    // Small delay to ensure page is fully loaded and cleared
    const timer = setTimeout(() => {
      login();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-700 to-orange-600">
        <div className="text-white text-xl">Checking authentication status...</div>
      </div>
    );
  }

  // If user is authenticated, don't render the sign-up form
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-700 to-orange-600">
        <div className="text-white text-xl text-center p-8 rounded-lg bg-white/10 backdrop-blur-lg">
          <div className="mb-4">You're already signed in!</div>
          <div>Redirecting to homepage...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-700 to-orange-600 p-4 sm:p-6 md:p-8 overflow-hidden relative">
      {/* Animated glowing background elements - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        {/* Central glowing orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Floating glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-10 left-10 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-xl animate-bounce" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-green-400/30 to-blue-400/30 blur-xl animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Additional moving glowing elements - hidden on smaller screens */}
        <div className="absolute top-1/3 right-1/3 w-10 h-10 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-400/40 to-blue-400/40 blur-lg animate-ping hidden md:block" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-purple-400/40 to-pink-400/40 blur-lg animate-pulse hidden md:block" style={{ animationDelay: '2.5s' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Glowing card with enhanced effects */}
        <div 
          className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] border border-white/20"
          style={{
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), 0 0 40px rgba(168, 85, 247, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              {/* Enhanced glowing logo */}
              <div className="mx-auto flex items-center justify-center -mt-6 sm:-mt-8 transform transition-transform duration-500 hover:rotate-12">
                <div 
                  className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <img 
                    src="/logo.svg" 
                    alt="TravelEase Logo" 
                    className="h-16 w-16 sm:h-24 sm:w-24 drop-shadow-2xl" 
                    style={{
                      filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
                    }}
                  />
                </div>
              </div>
              <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
                Welcome to TravelEase
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/80 drop-shadow">
                Sign up to start planning amazing trips
              </p>
            </div>

            <div className="mt-6 sm:mt-8">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="border-t border-white/30 flex-grow"></div>
                <div className="mx-2 sm:mx-4 text-xs sm:text-sm text-white/70">Continue with Google</div>
                <div className="border-t border-white/30 flex-grow"></div>
              </div>

              <div className="mt-4 sm:mt-6">
                {/* Enhanced glowing Google Sign-In button */}
                <button
                  onClick={() => {
                    clearGoogleOAuthData();
                    login();
                  }}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:rotate-1 group"
                  style={{
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.4), 0 3px 10px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <FcGoogle className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
                  <span className="text-sm sm:text-base font-bold">Continue with Google</span>
                </button>
                
                {/* Glowing info box */}
                <div 
                  className="mt-6 sm:mt-8 p-4 bg-white/10 rounded-lg sm:rounded-xl border border-white/20 backdrop-blur-lg"
                  style={{
                    boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1), 0 3px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center drop-shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Why Google Sign-In?
                  </h3>
                  <ul className="text-xs text-white/90 list-disc pl-4 sm:pl-5 space-y-1 drop-shadow">
                    <li>Quick and secure authentication</li>
                    <li>Sync your trips across devices</li>
                    <li>Access to personalized recommendations</li>
                  </ul>
                </div>
                
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => navigate('/')}
                    className="text-xs sm:text-sm text-white/80 hover:text-white font-medium flex items-center justify-center gap-1 mx-auto transition-all hover:gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced glowing footer */}
        <div 
          className="bg-white/10 backdrop-blur-lg px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl mt-4 sm:mt-6 border border-white/20"
          style={{
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-white drop-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure Google authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;