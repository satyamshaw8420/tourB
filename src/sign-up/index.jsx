import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { clearStaleOAuthData } from '@/utils/dataCleanup';

const SignUp = () => {
  const navigate = useNavigate();

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

  // Auto-trigger Google Sign-In when component mounts
  useEffect(() => {
    // Clear any existing OAuth data
    clearGoogleOAuthData();
    
    // Small delay to ensure page is fully loaded and cleared
    const timer = setTimeout(() => {
      login();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center">
              <img src="/logo.svg" alt="TravelEase Logo" className="h-16 w-16" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign up for TravelEase
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your account to start planning amazing trips
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-300 flex-grow"></div>
              <div className="mx-4 text-sm text-gray-500">Signing up with Google</div>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  clearGoogleOAuthData();
                  login();
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FcGoogle className="text-xl" />
                Continue with Google
              </button>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;