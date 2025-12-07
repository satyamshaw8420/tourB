import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Hero from './components/custom/Hero.jsx'
import TripHistory from './components/custom/TripHistory.jsx'
import TripDetails from './components/custom/TripDetails.jsx'
import SharedTripView from './components/custom/SharedTripView.jsx'
import GlobeVisualization from './components/custom/GlobeVisualization.jsx'
import TripComparison from './components/custom/TripComparison.jsx'
import OfflineTrips from './components/custom/OfflineTrips.jsx'
import WeatherIntegration from './components/custom/WeatherIntegration.jsx'
import SocialFeatures from './components/custom/SocialFeatures.jsx'
import DataVerification from './components/custom/DataVerification.jsx'
import ViewTrip from './view-trip/index.jsx'
import SignUp from './sign-up/index.jsx'
import FinancialPage from './components/custom/FinancialPage.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// Clear any stale Google OAuth data on app initialization
const clearStaleOAuthData = () => {
  // Clear sessionStorage entries that might interfere with OAuth
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('google') || key.includes('oauth')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Check if user data exists but is malformed
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (!parsed.email || !parsed._id) {
        // Remove malformed user data
        localStorage.removeItem('user');
      }
    }
  } catch (e) {
    // Remove corrupted user data
    localStorage.removeItem('user');
  }
};

// Function to clear all site data (can be used for complete reset)
const clearAllSiteData = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log("All site data cleared successfully");
  } catch (error) {
    console.error("Error clearing site data:", error);
  }
};

// Run cleanup on app start
clearStaleOAuthData();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Hero />
      },
      {
        path: '/trip-history',
        element: <TripHistory />
      },
      {
        path: '/trip-details/:tripId',
        element: <TripDetails />
      },
      {
        path: '/shared-trip/:shareId',
        element: <SharedTripView />
      },
      {
        path: '/globe',
        element: <GlobeVisualization />
      },
      {
        path: '/compare',
        element: <TripComparison />
      },
      {
        path: '/offline',
        element: <OfflineTrips />
      },
      {
        path: '/weather',
        element: <WeatherIntegration />
      },
      {
        path: '/social',
        element: <SocialFeatures />
      },
      {
        path: '/verify-data',
        element: <DataVerification />
      },
      {
        path: '/view-trip/:tripId',
        element: <ViewTrip />
      },
      {
        path: '/create-trip',
        element: <CreateTrip />
      },
      {
        path: '/sign-up',
        element: <SignUp />
      },
      {
        path: '/financial',
        element: <FinancialPage />
      }
    ]
  }
])

// Removed React.StrictMode which can sometimes cause issues with third-party libraries like Google OAuth
ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider 
    clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}
    onInitError={(error) => console.error('Google OAuth initialization error:', error)}
  >
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexProvider>
  </GoogleOAuthProvider>
)