import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';
import { clearAllUserData } from '@/utils/dataCleanup';
// Import the image service to get real destination images
import { searchDestinationImages } from '@/service/ImageGenerationService';

const BlueOrangeHero = () => {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [backgroundImage] = useState({
    url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
    alt: "Mountain landscape"
  });

  const sloganText = "Travel Together. Dream Bigger.";

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

  // Function to trigger Google Sign-In
  const handleGoogleSignIn = () => {
    // Navigate to the dedicated sign-up page
    navigate('/sign-up');
  };

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

  // Mark animation as complete after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Get random animation class for each letter
  const getRandomAnimationClass = (index) => {
    const animations = [
      'animate-drop-from-top',
      'animate-drop-from-left',
      'animate-drop-from-right',
      'animate-drop-from-bottom'
    ];
    return animations[index % animations.length];
  };

  return (
    <div className="relative overflow-hidden">
      {/* Static Background without any animation */}
      <div 
        className="relative bg-cover bg-center h-[600px] flex items-center"
        style={{
          backgroundImage: `url('${backgroundImage.url}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {!animationComplete ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 flex flex-wrap justify-center">
                {sloganText.split('').map((char, index) => (
                  <span
                    key={index}
                    className={`${getRandomAnimationClass(index)} animation-delay-${index % 10}`}
                    style={{ 
                      animationDelay: `${index * 0.15}s`,
                      display: 'inline-block'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </h1>
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
                Travel Together. Dream Bigger.
              </h1>
            )}
            <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
              Effortless travel planning with AI-powered itineraries, real-time collaboration, and personalized recommendations.
            </p>
            
            {/* Google Sign-In Button or Logout Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {user ? (
                // User is logged in - show logout button only
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-transparent border border-white text-white font-medium py-2 px-4 rounded-lg hover:bg-white hover:text-black transition-colors"
                  >
                    <span className="mr-1">←</span> Logout
                  </button>
                </div>
              ) : (
                // User is not logged in - show sign in button
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-3 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <FcGoogle className="text-xl" />
                  <span>Sign in with Google</span>
                </button>
              )}
              
              <button
                onClick={() => navigate('/create-trip')}
                className="!bg-white/80 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
              >
                Start Exploring
              </button>
              
              <button
                onClick={() => navigate('/financial')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
              >
                View Financing Options
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up-smooth {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-smooth {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes drop-from-top {
          0% {
            opacity: 0;
            transform: translateY(-150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes drop-from-left {
          0% {
            opacity: 0;
            transform: translateX(-150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes drop-from-right {
          0% {
            opacity: 0;
            transform: translateX(150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes drop-from-bottom {
          0% {
            opacity: 0;
            transform: translateY(150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-drop-from-top {
          animation: drop-from-top 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animate-drop-from-left {
          animation: drop-from-left 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animate-drop-from-right {
          animation: drop-from-right 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animate-drop-from-bottom {
          animation: drop-from-bottom 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animation-delay-0 { animation-delay: 0s; }
        .animation-delay-1 { animation-delay: 0.15s; }
        .animation-delay-2 { animation-delay: 0.3s; }
        .animation-delay-3 { animation-delay: 0.45s; }
        .animation-delay-4 { animation-delay: 0.6s; }
        .animation-delay-5 { animation-delay: 0.75s; }
        .animation-delay-6 { animation-delay: 0.9s; }
        .animation-delay-7 { animation-delay: 1.05s; }
        .animation-delay-8 { animation-delay: 1.2s; }
        .animation-delay-9 { animation-delay: 1.35s; }
      `}</style>
    </div>
  );
};

export default BlueOrangeHero;