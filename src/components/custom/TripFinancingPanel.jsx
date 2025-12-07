import React, { useState, useEffect } from 'react';

const TripFinancingPanel = ({ tripData, onClose }) => {
  const [activeTab, setActiveTab] = useState('payFull');
  const [emiUpfront, setEmiUpfront] = useState(0);
  const [emiTenure, setEmiTenure] = useState(3);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [walletAmount, setWalletAmount] = useState(0);
  const [nextDueDate, setNextDueDate] = useState('');

  // Calculate next due date (30 days from now)
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setNextDueDate(date.toLocaleDateString());
  }, []);

  // Extract total trip cost from tripData
  const totalTripCost = tripData?.estimatedTotalCostPerCouple?.total_range || '₹25,000 - ₹35,000';
  const numericTotal = parseInt(totalTripCost.replace(/[₹,]/g, '')) || 0;
  
  const emiCalculations = {
    monthlyPayment: Math.round((numericTotal - emiUpfront) / emiTenure),
    totalPayable: numericTotal + Math.round(numericTotal * 0.02 * emiTenure / 12), // 2% interest
    totalInterest: Math.round(numericTotal * 0.02 * emiTenure / 12),
  };

  // Recommended EMI plans
  const recommendedPlans = [
    { name: "Smart plan", amount: Math.round(numericTotal * 0.125), months: 6 },
    { name: "Low EMI", amount: Math.round(numericTotal * 0.075), months: 10 },
    { name: "Quick plan", amount: Math.round(numericTotal * 0.2), months: 3 }
  ];

  // Add-ons
  const addons = [
    { id: 'insurance', name: 'Travel Insurance', price: '₹1,500' },
    { id: 'seat', name: 'Preferred Seat Selection', price: '₹500' },
    { id: 'meal', name: 'Special Meal Preferences', price: '₹300' },
    { id: 'support', name: 'Priority Support', price: '₹1,000' },
    { id: 'upgrade', name: 'Hotel Room Upgrade', price: '₹3,000' }
  ];

  // Handle addon selection
  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Handle quick add to wallet
  const addToWallet = (amount) => {
    setWalletAmount(walletAmount + amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">Trip Financing Options</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row w-full">
          {/* Left Panel - Spline 3D Visualization */}
          <div className="w-full lg:w-1/2 h-96 lg:h-full min-h-[400px]">
            <div className="w-full h-full overflow-hidden relative">
              <iframe 
                src='https://my.spline.design/techinspired3dassetslock-ejurCj9Jy57BC9ajbYUDAgO7/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                title='3D Lock Visualization'
                className="w-full h-full absolute inset-0"
                style={{ minHeight: '400px' }}
              ></iframe>
            </div>
          </div>

          {/* Right Panel - Financing Options */}
          <div className="w-full lg:w-1/2 p-6 bg-white overflow-y-auto">
            <div className="max-w-2xl mx-auto h-full flex flex-col">
              <div className="flex-grow">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Financing & Payment Options</h1>
                <p className="text-gray-600 mb-8">How would you like to afford this trip?</p>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
                  {[
                    { id: 'payFull', label: 'Pay in Full' },
                    { id: 'emi', label: 'EMI Plan' },
                    { id: 'split', label: 'Split with Friends' },
                    { id: 'wallet', label: 'Trip Wallet' },
                    { id: 'offers', label: 'Offers & Rewards' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="mb-8">
                  {/* Pay in Full */}
                  {activeTab === 'payFull' && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pay in Full Now</h2>
                      <p className="text-gray-600 mb-6">Simple and straightforward payment with no extra charges.</p>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-2xl font-bold text-gray-900">{totalTripCost}</span>
                        </div>
                        <div className="text-sm text-gray-500">Payment methods: UPI, Card, Netbanking, Wallet</div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
                        Pay Now
                      </button>
                    </div>
                  )}

                  {/* EMI Plan */}
                  {activeTab === 'emi' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">EMI / Monthly Plan</h2>
                      <p className="text-gray-600 mb-6">Spread the cost over time with flexible EMIs.</p>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Total Trip Cost</span>
                          <span className="text-xl font-bold text-gray-900">{totalTripCost}</span>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Pay now:</span>
                            <span className="font-medium">₹{emiUpfront.toLocaleString()}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={numericTotal}
                            value={emiUpfront}
                            onChange={(e) => setEmiUpfront(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>₹0</span>
                            <span>₹{numericTotal.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Tenure:</span>
                            <span className="font-medium">{emiTenure} months</span>
                          </div>
                          <div className="flex gap-2">
                            {[3, 6, 9, 12].map((months) => (
                              <button
                                key={months}
                                onClick={() => setEmiTenure(months)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                                  emiTenure === months
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {months}M
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm text-green-600">Monthly Payment</div>
                            <div className="text-lg font-bold text-green-800">₹{emiCalculations.monthlyPayment.toLocaleString()}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm text-green-600">Total Interest</div>
                            <div className="text-lg font-bold text-green-800">₹{emiCalculations.totalInterest.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-4">
                          Next payment due: {nextDueDate}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Recommended Plans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {recommendedPlans.map((plan, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setEmiUpfront(numericTotal - (plan.amount * plan.months));
                                setEmiTenure(plan.months);
                              }}
                              className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-green-500 hover:bg-green-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{plan.name}</div>
                              <div className="text-sm text-gray-600">₹{plan.amount.toLocaleString()} × {plan.months} months</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md">
                        Select EMI Plan
                      </button>
                    </div>
                  )}

                  {/* Split with Friends */}
                  {activeTab === 'split' && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Split with Friends</h2>
                      <p className="text-gray-600 mb-6">Share the cost with your travel companions.</p>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-xl font-bold text-gray-900">{totalTripCost}</span>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of People</label>
                          <select className="w-full p-2 border border-gray-300 rounded-md">
                            <option>2 People</option>
                            <option>3 People</option>
                            <option>4 People</option>
                            <option>5 People</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="text-sm text-purple-600">Your Share</div>
                            <div className="text-lg font-bold text-purple-800">₹12,500</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="text-sm text-purple-600">Per Person</div>
                            <div className="text-lg font-bold text-purple-800">₹8,333</div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all shadow-md">
                        Split & Share
                      </button>
                    </div>
                  )}

                  {/* Trip Wallet */}
                  {activeTab === 'wallet' && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Wallet</h2>
                      <p className="text-gray-600 mb-6">Use your saved funds for this trip.</p>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Wallet Balance</span>
                          <span className="text-xl font-bold text-gray-900">₹{walletAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                          {[5000, 10000, 15000].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => addToWallet(amount)}
                              className="flex-1 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                            >
                              +₹{amount.toLocaleString()}
                            </button>
                          ))}
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Amount</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Enter amount"
                              className="flex-1 p-2 border border-gray-300 rounded-md"
                            />
                            <button className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors">
                              Add
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="text-sm text-amber-600">Remaining after payment</div>
                          <div className="text-lg font-bold text-amber-800">₹{(walletAmount - numericTotal).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md">
                        Use Wallet Balance
                      </button>
                    </div>
                  )}

                  {/* Offers & Rewards */}
                  {activeTab === 'offers' && (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Special Offers & Rewards</h2>
                      <p className="text-gray-600 mb-6">Take advantage of exclusive deals and rewards.</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className="bg-white border border-rose-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">10% Cashback Offer</h3>
                              <p className="text-sm text-gray-600">On payments via credit card</p>
                            </div>
                            <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">Active</span>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-rose-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">5% Discount with Partner Airlines</h3>
                              <p className="text-sm text-gray-600">Valid for flights booked this month</p>
                            </div>
                            <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">Active</span>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-4 opacity-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">Free Travel Insurance</h3>
                              <p className="text-sm text-gray-600">On trips over ₹50,000</p>
                            </div>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Inactive</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all shadow-md">
                        Apply Selected Offers
                      </button>
                    </div>
                  )}
                </div>

                {/* Add-ons Section */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Enhance Your Trip</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addons.map((addon) => (
                      <div 
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedAddons.includes(addon.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{addon.name}</div>
                            <div className="text-sm text-gray-600">{addon.price}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddons.includes(addon.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedAddons.includes(addon.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secure Payment Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white mb-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <div>
                      <div className="font-semibold">100% Secure Payments</div>
                      <div className="text-sm opacity-90">Powered by Razorpay & Stripe</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <button 
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripFinancingPanel;