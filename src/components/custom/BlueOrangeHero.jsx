import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth'; // Import the new auth hook
// Import the image service to get real destination images
import { searchDestinationImages } from '@/service/ImageGenerationService';
// Import the new carousel components
import AnimatedHomepageCarousel from './AnimatedHomepageCarousel';
import AnimatedTaglineCarousel from './AnimatedTaglineCarousel';
import LazySection from './LazySection';

const BlueOrangeHero = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the new auth hook
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Handle tagline index changes
  const handleTaglineIndexChange = (index) => {
    setTaglineIndex(index);
  };

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
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Animated Carousel Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatedHomepageCarousel currentIndex={taglineIndex} />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* Animated tagline carousel */}
            <AnimatedTaglineCarousel onIndexChange={handleTaglineIndexChange} />
            
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
                  className="flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FcGoogle className="text-2xl" />
                  <span className="text-base">Sign in with Google</span>
                </button>
              )}
              
              <button
                onClick={() => navigate('/create-trip')}
                className="backdrop-blur-lg  text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg border border-white/50"
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
      
      {/* Why Choose TravelEase Section */}
      <LazySection animationType="slide-up" delay={0.2}>
        <div className="relative z-10 bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Why Choose TravelEase?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover the features that make TravelEase the ultimate travel planning companion</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1: AI-Powered Itineraries */}
            <LazySection animationType="slide-up" delay={0.3}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Itineraries</h3>
                <p className="text-gray-600">Our advanced AI creates personalized travel plans tailored to your preferences, budget, and travel style. No more generic itineraries - get recommendations that truly match your interests.</p>
              </div>
            </LazySection>
            
            {/* Feature 2: Real-Time Collaboration */}
            <LazySection animationType="slide-up" delay={0.4}>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Collaboration</h3>
                <p className="text-gray-600">Plan trips with friends and family in real-time. Share, edit, and finalize itineraries together, regardless of your location. Perfect for group travel planning.</p>
              </div>
            </LazySection>
            
            {/* Feature 3: Financial Planning */}
            <LazySection animationType="slide-up" delay={0.5}>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Financial Planning</h3>
                <p className="text-gray-600">Manage your travel budget with our comprehensive financial tools. Split costs, explore EMI options, and track expenses - all in one place.</p>
              </div>
            </LazySection>
            
            {/* Feature 4: Interactive Maps */}
            <LazySection animationType="slide-up" delay={0.6}>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Maps & Visualization</h3>
                <p className="text-gray-600">Visualize your journey with our interactive maps and 3D globe visualization. See your route, points of interest, and travel timeline in an engaging way.</p>
              </div>
            </LazySection>
            
            {/* Feature 5: Weather Integration */}
            <LazySection animationType="slide-up" delay={0.7}>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Weather Integration</h3>
                <p className="text-gray-600">Stay prepared with detailed weather forecasts for your destinations. Our system integrates weather data to help you pack appropriately and adjust plans as needed.</p>
              </div>
            </LazySection>
            
            {/* Feature 6: Offline Access */}
            <LazySection animationType="slide-up" delay={0.8}>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Offline Trip Access</h3>
                <p className="text-gray-600">Download your itineraries for offline access. Never worry about losing connectivity during your travels - all your trip details are available anytime, anywhere.</p>
              </div>
            </LazySection>
          </div>
          
          {/* Comparison with Competitors */}
          <LazySection animationType="slide-up" delay={0.9}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">What Makes TravelEase Different?</h2>
              <p className="text-xl mb-10 text-center max-w-4xl mx-auto">While other travel apps offer basic planning tools, TravelEase provides a comprehensive ecosystem that transforms how you plan, experience, and remember your journeys.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  TravelEase Advantages
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>True AI Personalization:</strong> Unlike generic recommendation engines, our AI learns from your preferences to create genuinely personalized travel experiences.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>All-in-One Platform:</strong> From initial planning to post-trip sharing, everything is seamlessly integrated in one place - no need to juggle multiple apps.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Collaborative Planning:</strong> Real-time collaboration features that rival professional project management tools, making group travel planning effortless.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Financial Intelligence:</strong> Comprehensive budgeting tools that go beyond simple expense tracking to offer smart savings suggestions and payment options.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Immersive Visualization:</strong> 3D globe visualization and interactive maps that bring your travel plans to life, offering a preview of your journey.</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <svg className="w-8 h-8 mr-3 text-red-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Limitations of Other Apps
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span><strong>Fragmented Experience:</strong> Most apps require switching between multiple platforms for planning, booking, and sharing, leading to a disjointed experience.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span><strong>Limited Personalization:</strong> Generic recommendations based on popularity rather than personal preferences and travel history.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span><strong>Poor Collaboration:</strong> Basic sharing features that don't support real-time collaborative planning or decision-making.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span><strong>Basic Financial Tools:</strong> Simple expense trackers that lack sophisticated budgeting, saving options, or payment flexibility.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span><strong>Static Content:</strong> Flat lists and images instead of immersive, interactive previews of destinations and itineraries.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-2xl font-bold mb-6">Ready to experience the future of travel planning?</p>
              <button 
                onClick={() => navigate('/create-trip')}
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg"
              >
                Start Your Journey Today
              </button>
            </div>
          </div>
        </LazySection>
        </div>
      </div>
    </LazySection>
    </div>
  );
};

export default BlueOrangeHero;