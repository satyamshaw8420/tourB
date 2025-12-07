import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { chatSession } from '@/service/AIModal'
import { FcGoogle } from 'react-icons/fc'
import axios from 'axios'
// Firebase imports
// Convex import
import { useSaveTrip } from '@/hooks/useConvexTrip';
// Image generation service
import { getDestinationImage, generatePlaceholderImage } from '@/service/ImageGenerationService';
// Data cleanup utility
import { clearAllUserData } from '@/utils/dataCleanup';

// Import the enhanced AI service
import { generateTravelPlanWithRealHotels } from '../service/AIModal';

function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: { label: '' },
    travelers: null,
    days: '',
    budget: null
  });
  
  // Convex mutation for saving trips
  const { saveTripToConvex: saveTrip } = useSaveTrip();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [destinationImage, setDestinationImage] = useState(null); // New state for destination image
  const [user, setUser] = useState(null); // Track user authentication state
  // Add missing state variables
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Listen for the custom event from Header to show Google Sign-In
  useEffect(() => {
    const handleOpenGoogleSignin = () => {
      // Check if user is already logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        // User is already logged in, don't show login modal
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // If there's an error parsing user data, show login modal
          setShowLoginModal(true);
        }
      } else {
        // User is not logged in, redirect to sign-up page instead of showing modal
        navigate('/sign-up');
      }
    };

    window.addEventListener('open-google-signin', handleOpenGoogleSignin);

    // Also check if we came from homepage and should show login modal
    const authSource = localStorage.getItem('authSource');
    if (authSource === 'homepage') {
      const userData = localStorage.getItem('user');
      if (!userData) {
        // User is not logged in, redirect to sign-up page instead of showing modal
        navigate('/sign-up');
      }
    }

    return () => {
      window.removeEventListener('open-google-signin', handleOpenGoogleSignin);
    };
  }, [navigate]);

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
          message: "Successfully Logged In"
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(formattedUserData));
        console.log("User data stored in localStorage:", formattedUserData);
        
        // Update user state
        setUser(formattedUserData);
        
        // Show success message
        toast.success("Welcome! You've been successfully signed in.");
        
        // Check if we should continue trip creation
        const continueCreation = localStorage.getItem('continueTripCreation');
        if (continueCreation === 'true') {
          // Continue with trip creation
          handleCreateTrip();
          // Clean up the flag
          localStorage.removeItem('continueTripCreation');
        } else {
          // Check where the user came from to determine redirect behavior
          const authSource = localStorage.getItem('authSource');
          if (authSource === 'homepage') {
            // If user came from homepage, redirect to homepage
            navigate('/');
          } else if (authSource === 'header') {
            // If user came from header, redirect to homepage
            navigate('/');
          } else {
            // If user came from trying to create a trip, stay on the create-trip page
            // Don't navigate anywhere, just close the modal and let them continue
            // The modal is already closed in the onSuccess handler
          }
          
          // Clean up the authSource
          localStorage.removeItem('authSource');
        }
      })
      .catch(error => {
        console.log("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile. Please try again.");
      });
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

  // Debounce timer ref
  const debounceTimer = useRef(null)

  const fetchSuggestions = async (searchQuery) => {
    console.log('Fetching suggestions for:', searchQuery);
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      // Using Photon API (free and open-source, faster alternative to Nominatim)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'TravelEase/1.0 (educational project)',
            'Accept': 'application/json',
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Photon returns features array, we need to map it to our expected format
        const suggestions = data.features || []
        // Log the structure of the location data to console (similar to YouTube tutorial)
        console.log('Location suggestions:', {
          location: suggestions.map(item => ({
            label: item.properties.name,
            value: {
              description: item.properties.name,
              place_id: item.properties.osm_id,
              // ... other properties
            }
          }))
        })
        setSuggestions(suggestions)
        setShowSuggestions(true)
      } else {
        console.error('API request failed with status:', response.status);
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name, value) => {
    // Add validation for days field - limit to 5 or less
    if (name === 'days') {
      const daysValue = parseInt(value);
      if (!isNaN(daysValue) && daysValue > 13) {
        console.log("Please enter Trip Days less than 13");
        // Prevent values greater than 5
        return;
      }
    }
    
    console.log('Updating form data:', name, value);
    if (name === 'destination') {
      // For destination, we update the location.label property
      setFormData(prev => ({
        ...prev,
        location: { label: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    handleInputChange('destination', value);
      
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce
  };

  const handleSuggestionClick = (suggestion) => {
    const locationLabel = suggestion.properties.name || '';
    handleInputChange('destination', locationLabel);
    setShowSuggestions(false);
    
    // Also update the location object with more details
    setFormData(prev => ({
      ...prev,
      location: {
        label: locationLabel,
        value: {
          description: locationLabel,
          place_id: suggestion.properties.osm_id
        }
      }
    }));
    
    // Generate image for the selected destination
    generateDestinationImage(locationLabel);
  };

  // Function to generate image for a destination
  const generateDestinationImage = async (destination) => {
    if (!destination) return;
    
    try {
      setLoading(true);
      console.log(`Generating image for destination: ${destination}`);
      
      // Try to get a real image from Pixabay
      const imageUrl = await getDestinationImage(destination);
      
      if (imageUrl) {
        setDestinationImage(imageUrl);
        console.log(`Found image for ${destination}: ${imageUrl}`);
      } else {
        // Fallback to placeholder image
        const placeholderUrl = generatePlaceholderImage(destination);
        setDestinationImage(placeholderUrl);
        console.log(`Using placeholder image for ${destination}: ${placeholderUrl}`);
      }
    } catch (error) {
      console.error('Error generating destination image:', error);
      // Fallback to placeholder image on error
      const placeholderUrl = generatePlaceholderImage(destination);
      setDestinationImage(placeholderUrl);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    console.log("Form submitted with data:", formData);
    
    // Validate form data
    if (!formData.location?.label) {
      toast.warning("📍 Please enter a destination");
      return;
    }
    
    if (!formData.travelers) {
      toast.warning("👥 Please select number of travelers");
      return;
    }
    
    if (!formData.days) {
      toast.warning("📅 Please enter number of days");
      return;
    }
    
    if (!formData.budget) {
      toast.warning("💰 Please select a budget option");
      return;
    }
    
    const daysNum = parseInt(formData.days);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.warning("📅 Please enter a valid number of days");
      return;
    }
    
    if (daysNum > 13) {
      toast.warning("📅 Please enter Trip Days less than 13");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      // Set flag to continue trip creation after login
      localStorage.setItem('continueTripCreation', 'true');
      setShowLoginModal(true);
      return;
    }
    
    // Proceed with trip creation using the enhanced method
    OnCreateTrip();
  };

  const handleCreateTrip = async () => {
    console.log("Creating trip with data:", formData);
    setIsCreatingTrip(true);
    
    try {
      // Get user data from localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userEmail = user?.email || 'unknown';
      const userId = user?._id || 'anonymous';
      
      // Prepare prompt for AI
      const FINAL_PROMPT = AI_PROMPT
        .replace('{location}', formData.location.label)
        .replace('{totalDays}', formData.days)
        .replace('{traveler}', SelectTravelesList.find(item => item.id == formData.travelers)?.people || '')
        .replace('{budget}', SelectBudgetOptions.find(item => item.id == formData.budget)?.title || '')
        .replace('{totalDays}', formData.days);

      console.log("Sending prompt to AI:", FINAL_PROMPT);
      
      // Send to Gemini AI
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      console.log("AI Response:", result?.response?.text());
      
      // Save trip to database with proper parameters
      const tripData = result?.response?.text();
      console.log("Saving trip data:", tripData);
      
      const tripId = await saveTrip(tripData, formData, userEmail, userId);
      console.log("Trip saved with ID:", tripId);
      
      // Navigate to trip details page
      if (tripId) {
        toast.success("🎉 Trip created successfully!");
        navigate(`/view-trip/${tripId}`);
      } else {
        throw new Error("Failed to save trip");
      }
    } catch (err) {
      console.error("Error creating trip:", err);
      toast.error("❌ Failed to create trip. Please try again.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const OnCreateTrip = async () => {
    console.log("Creating trip with data:", formData);
    
    // Validate form data
    if (!formData.location?.label) {
      toast.error("Please select a destination");
      return;
    }
    
    if (!formData.days) {
      toast.error("Please enter the number of days");
      return;
    }
    
    if (!formData.travelers) {
      toast.error("Please select the number of travelers");
      return;
    }
    
    if (!formData.budget) {
      toast.error("Please select a budget option");
      return;
    }
    
    // Get user data from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userEmail = user?.email || 'unknown';
    const userId = user?._id || 'anonymous';
    
    try {
      setIsCreatingTrip(true);
      
      // Prepare prompt for AI with real hotel data
      toast.promise(
        generateTravelPlanWithRealHotels(formData),
        {
          loading: 'Generating your personalized trip...',
          success: (tripData) => {
            console.log("AI generated trip data:", tripData);
            
            // Save trip to database with proper parameters
            return saveTrip(tripData, formData, userEmail, userId).then(tripId => {
              console.log("Trip saved with ID:", tripId);
              
              // Navigate to trip details page
              if (tripId) {
                navigate(`/view-trip/${tripId}`);
                return "🎉 Trip created successfully!";
              } else {
                throw new Error("Failed to save trip");
              }
            });
          },
          error: (error) => {
            console.error("Error creating trip:", error);
            return "❌ Failed to create trip. Please try again.";
          }
        }
      );
    } catch (err) {
      console.error("Error in OnCreateTrip:", err);
      toast.error("❌ Failed to create trip. Please try again.");
      setIsCreatingTrip(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Background with image and overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1920&auto=format&fit=crop')",
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Semi-transparent overlay to ensure content readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-white/80 to-purple-900/10 backdrop-blur-[2px]"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-bold text-3xl text-center">🗺️ Describe Your Trip</h2>
        <p className="text-gray-500 text-center mt-3">
          ✨ Just provide some basic information, and our AI will create a customized travel plan for you.
        </p>

        {/* Destination Image Preview */}
        {destinationImage && (
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-2xl h-64 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={destinationImage} 
                alt={`Preview of ${formData.location.label}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a more reliable placeholder if image fails to load
                  e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{formData.location.label}</h3>
              </div>
            </div>
          </div>
        )}

        <div className='mt-10'>
          {/* Destination Field */}
          <div>
            <h2 className='text-lg font-medium'>📍 Destination</h2>
            <p className='text-gray-500 text-sm'>
              🌍 Where do you want to go?
            </p>
            <div className="relative mt-2">
              <Input 
                placeholder="e.g., Paris, France" 
                value={formData.location.label}
                onChange={handleDestinationChange}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.properties.osm_id}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">✈️ {suggestion.properties.name}</div>
                      <div className="text-sm text-gray-500">
                        📍 {suggestion.properties.country || suggestion.properties.state || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showSuggestions && suggestions.length === 0 && formData.location?.label?.length > 2 && !loading && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 p-2">
                  <div className="p-2 text-gray-500">❌ No locations found</div>
                </div>
              )}
            </div>
          </div>

          {/* Traveler Selection */}
          <div className='mt-10'>
            <h2 className='text-lg font-medium'>👥 Number of Travelers</h2>
            <p className='text-gray-500 text-sm'>
              👨‍👩‍👧‍👦 Choose how many people are traveling
            </p>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mt-5'>
              {SelectTravelesList.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleInputChange('travelers', item.id)}
                  className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all bg-white/80 backdrop-blur-sm
                    ${formData.travelers === item.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300'}`}
                >
                  <h2 className='text-lg font-semibold'>🧳 {item.title}</h2>
                  <h2 className='text-sm text-gray-500'>📝 {item.desc}</h2>
                </div>
              ))}
            </div>
          </div>

          {/* Days Input */}
          <div className='mt-10'>
            <h2 className='text-lg font-medium'>📅 Number of Days</h2>
            <p className='text-gray-500 text-sm'>
              🕐 How many days will your trip last?
            </p>
            <Input 
              placeholder="e.g., 3" 
              type="number"
              min="1"
              max="13"
              value={formData.days}
              onChange={(e) => handleInputChange('days', e.target.value)}
              className="mt-2 bg-white/80 backdrop-blur-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              ⏳ Maximum 13 days allowed
            </p>
          </div>

          {/* Budget Selection */}
          <div className='mt-10'>
            <h2 className='text-lg font-medium'>💰 Budget</h2>
            <p className='text-gray-500 text-sm'>
              💵 What is your budget range?
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-5'>
              {SelectBudgetOptions.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleInputChange('budget', item.id)}
                  className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all bg-white/80 backdrop-blur-sm
                    ${formData.budget === item.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300'}`}
                >
                  <h2 className='text-lg font-semibold'>💳 {item.title}</h2>
                  <h2 className='text-sm text-gray-500'>📋 {item.desc}</h2>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className='mt-10'>
            <Button 
              onClick={onSubmit}
              disabled={isCreatingTrip}
              className="w-full py-6 text-lg bg-black text-white hover:bg-gray-800 transition-all"
            >
              {isCreatingTrip ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  🤖 Creating Trip...
                </div>
              ) : (
                "🚀 Create Trip"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4 backdrop-blur-sm bg-white/90">
            <h2 className="text-2xl font-bold mb-4">🔐 Sign in to Continue</h2>
            <p className="text-gray-600 mb-6">
              📲 Please sign in with Google to create and save your trip plans.
            </p>
            <button
              onClick={() => navigate('/sign-up')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors backdrop-blur-sm"
            >
              <FcGoogle className="text-xl" />
              Sign in with Google
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 font-medium py-2"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTrip;