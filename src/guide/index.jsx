import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaMapMarkerAlt, FaStar, FaMoneyBillWave, FaCalendarAlt, FaComments, FaCertificate, FaGlobeAmericas } from 'react-icons/fa';

const GuidePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('benefits');

  const benefits = [
    {
      icon: <FaMoneyBillWave className="text-2xl text-blue-500" />,
      title: "Earn Extra Income",
      description: "Turn your local knowledge into a profitable opportunity by guiding travelers."
    },
    {
      icon: <FaGlobeAmericas className="text-2xl text-green-500" />,
      title: "Share Your Passion",
      description: "Showcase your city's hidden gems and unique experiences to visitors."
    },
    {
      icon: <FaStar className="text-2xl text-yellow-500" />,
      title: "Build Reputation",
      description: "Gain ratings and reviews to establish yourself as a trusted local expert."
    },
    {
      icon: <FaCertificate className="text-2xl text-purple-500" />,
      title: "Professional Development",
      description: "Access training and certification programs to enhance your guiding skills."
    }
  ];

  const requirements = [
    "Fluent in English and local languages",
    "Extensive knowledge of local history, culture, and attractions",
    "Friendly and outgoing personality",
    "Reliable transportation method",
    "Smartphone with internet connectivity",
    "Valid government ID and background check"
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your guide profile with your expertise and preferred locations."
    },
    {
      step: 2,
      title: "Get Verified",
      description: "Complete our verification process to build trust with travelers."
    },
    {
      step: 3,
      title: "Start Guiding",
      description: "Receive trip requests and start earning by showing travelers around."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Become a TravelEase Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your local expertise and earn money by guiding travelers through unforgettable experiences in your city.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Why Become a TravelEase Guide?
              </h2>
              <p className="text-gray-600 mb-6">
                Join thousands of local experts who are transforming travel experiences while earning extra income. 
                Our platform connects you with travelers seeking authentic, personalized experiences.
              </p>
              <button 
                onClick={() => navigate('/sign-up')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started Today
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl w-64 h-64 flex items-center justify-center shadow-xl">
                  <FaUserTie className="text-white text-8xl" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 rounded-full p-4 shadow-lg">
                  <FaStar className="text-white text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`py-4 px-6 font-medium text-lg ${activeTab === 'benefits' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Benefits
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`py-4 px-6 font-medium text-lg ${activeTab === 'requirements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`py-4 px-6 font-medium text-lg ${activeTab === 'how-it-works' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            How It Works
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">What We Look For</h3>
            <ul className="space-y-4">
              {requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700 text-lg">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey as a Guide?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Join our community of passionate local guides and start earning while sharing your love for your city.
          </p>
          <button 
            onClick={() => navigate('/sign-up')}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Become a Guide Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;