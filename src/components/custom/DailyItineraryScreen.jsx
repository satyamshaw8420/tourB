import React from 'react';
import { convertItineraryToUIBlueprint } from '../../utils/itineraryToUIBlueprint';

const DailyItineraryScreen = ({ itineraryJson, userSelection }) => {
  // Convert the itinerary JSON to UI blueprint
  const uiBlueprint = convertItineraryToUIBlueprint(itineraryJson, userSelection);

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(to bottom, #001E3C, #008A8A, #A8F3DA)",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Main grid layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr 300px",
        gap: "20px",
        height: "calc(100vh - 40px)"
      }}>
        
        {/* Left Sidebar */}
        <div style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(40px)",
          borderRadius: "24px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          color: "white",
          overflowY: "auto"
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>✈️</div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{uiBlueprint.sidebar.title}</h2>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Destinations</h3>
            {uiBlueprint.sidebar.destinations.map((destination, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>{destination}</div>
            ))}
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Trip Info</h3>
            <div style={{ marginBottom: "5px" }}>{uiBlueprint.sidebar.tripDuration}</div>
            <div style={{ marginBottom: "5px" }}>{uiBlueprint.sidebar.travelers}</div>
            <div style={{ marginBottom: "5px" }}>{uiBlueprint.sidebar.budget}</div>
          </div>
          
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Day Stepper</h3>
            {uiBlueprint.sidebar.dayStepper.map((day, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: "10px", 
                  marginBottom: "8px", 
                  backgroundColor: index === 0 ? "rgba(0, 240, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  cursor: "pointer"
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Center Main Content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto"
        }}>
          {/* Hotel Strip */}
          <div style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(40px)",
            borderRadius: "24px",
            padding: "15px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            overflowX: "auto"
          }}>
            <div style={{ 
              display: "flex", 
              gap: "15px",
              paddingBottom: "10px"
            }}>
              {uiBlueprint.hotelStrip.map((hotel, index) => (
                <div 
                  key={index} 
                  style={{
                    minWidth: "250px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    padding: "15px",
                    position: "relative"
                  }}
                >
                  <img 
                    src={hotel.hotelImageUrl} 
                    alt={hotel.hotelName}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      marginBottom: "10px"
                    }}
                  />
                  <h3 style={{ 
                    fontSize: "16px", 
                    fontWeight: "bold", 
                    marginBottom: "5px",
                    color: "white"
                  }}>{hotel.hotelName}</h3>
                  <div style={{ 
                    fontSize: "14px", 
                    marginBottom: "5px",
                    color: "rgba(255, 255, 255, 0.9)"
                  }}>{hotel.hotelAddress}</div>
                  <div style={{ 
                    fontSize: "14px", 
                    marginBottom: "5px",
                    color: "rgba(255, 255, 255, 0.9)"
                  }}>{hotel.pricePerNight}</div>
                  <div style={{ 
                    fontSize: "14px", 
                    marginBottom: "10px",
                    color: "rgba(255, 255, 255, 0.9)"
                  }}>Rating: {hotel.rating}/5</div>
                  <div style={{ 
                    fontSize: "12px", 
                    marginBottom: "15px",
                    color: "rgba(255, 255, 255, 0.8)"
                  }}>{hotel.keyAmenities}</div>
                  <div style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    fontSize: "12px",
                    color: "#00F0FF",
                    cursor: "pointer"
                  }}>{hotel.viewOnMapIndicator}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Daily Itinerary */}
          <div style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(40px)",
            borderRadius: "24px",
            padding: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            flex: 1
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              color: "white"
            }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>{uiBlueprint.dailyItinerary.header.title}</h2>
                <h3 style={{ fontSize: "18px" }}>{uiBlueprint.dailyItinerary.header.subtitle}</h3>
                <div style={{ fontSize: "14px" }}>{uiBlueprint.dailyItinerary.header.date}</div>
              </div>
              {uiBlueprint.dailyItinerary.header.weatherChip && (
                <div style={{
                  background: "rgba(0, 240, 255, 0.2)",
                  padding: "8px 15px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  🌤️ {uiBlueprint.dailyItinerary.header.weatherChip}
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {uiBlueprint.dailyItinerary.activities.map((activity, index) => (
                <div 
                  key={index} 
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "20px",
                    padding: "20px",
                    position: "relative"
                  }}
                >
                  {/* Top Row */}
                  <div style={{ 
                    display: "flex", 
                    marginBottom: "15px",
                    gap: "15px"
                  }}>
                    <img 
                      src={activity.topRow.placeImageUrl} 
                      alt={activity.topRow.placeName}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "12px"
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "5px"
                      }}>
                        <h3 style={{ 
                          fontSize: "18px", 
                          fontWeight: "bold",
                          color: "white"
                        }}>{activity.topRow.placeName}</h3>
                        <div style={{
                          background: "rgba(0, 240, 255, 0.3)",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px"
                        }}>{activity.topRow.category}</div>
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: "rgba(255, 255, 255, 0.9)",
                        marginBottom: "10px"
                      }}>{activity.topRow.placeDetails}</div>
                    </div>
                  </div>
                  
                  {/* Middle Grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    marginBottom: "15px"
                  }}>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "10px",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Best Time</div>
                      <div style={{ fontSize: "14px", color: "white" }}>{activity.middleGrid.bestTime}</div>
                    </div>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "10px",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Duration</div>
                      <div style={{ fontSize: "14px", color: "white" }}>{activity.middleGrid.duration}</div>
                    </div>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "10px",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Ticket</div>
                      <div style={{ fontSize: "14px", color: "white" }}>{activity.middleGrid.ticketPricing}</div>
                    </div>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "10px",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Rating</div>
                      <div style={{ fontSize: "14px", color: "white" }}>{activity.middleGrid.rating}/5</div>
                    </div>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "10px",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Accessibility</div>
                      <div style={{ fontSize: "14px", color: "white" }}>{activity.middleGrid.accessibility}</div>
                    </div>
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "10px",
                      borderRadius: "12px"
                    }}>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Transport</div>
                      <div style={{ fontSize: "14px", color: "white" }}>{activity.middleGrid.nearestTransport}</div>
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px"
                  }}>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "rgba(255, 255, 255, 0.9)"
                    }}>{activity.bottomRow.travelFromPrevious}</div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "rgba(255, 255, 255, 0.9)"
                    }}>{activity.bottomRow.tips}</div>
                  </div>
                  
                  {/* Bottom Tags */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {activity.bottomTags.seasonalConsiderations && (
                      <div style={{
                        background: "rgba(255, 215, 0, 0.2)",
                        padding: "5px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "gold"
                      }}>
                        📅 {activity.bottomTags.seasonalConsiderations}
                      </div>
                    )}
                    {activity.bottomTags.whatToBring && (
                      <div style={{
                        background: "rgba(0, 240, 255, 0.2)",
                        padding: "5px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#00F0FF"
                      }}>
                        🎒 {activity.bottomTags.whatToBring}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Panel */}
        <div style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(40px)",
          borderRadius: "24px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          color: "white",
          overflowY: "auto"
        }}>
          {/* Local Insights */}
          <div style={{ marginBottom: "30px" }}>
            <h2 style={{ 
              fontSize: "20px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              textAlign: "center"
            }}>Local Insights</h2>
            
            {Object.entries(uiBlueprint.rightPanel.localInsights).map(([key, insight]) => (
              <div 
                key={key} 
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "bold", 
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  {key === 'weather' && '🌤️'}
                  {key === 'transport' && '🚇'}
                  {key === 'cuisine' && '🍽️'}
                  {key === 'customs' && '👥'}
                  {key === 'language' && '💬'}
                  {insight.title}
                </h3>
                <div style={{ 
                  fontSize: "14px", 
                  color: "rgba(255, 255, 255, 0.9)"
                }}>{insight.content}</div>
              </div>
            ))}
          </div>
          
          {/* Emergency Contacts */}
          <div>
            <h2 style={{ 
              fontSize: "20px", 
              fontWeight: "bold", 
              marginBottom: "15px",
              textAlign: "center"
            }}>Emergency Contacts</h2>
            
            <div style={{
              background: "rgba(255, 0, 0, 0.15)",
              borderRadius: "16px",
              padding: "15px"
            }}>
              {Object.entries(uiBlueprint.rightPanel.emergencyContacts).map(([key, contact]) => (
                <div 
                  key={key} 
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: "bold"
                  }}>
                    {key === 'police' && '👮'}
                    {key === 'ambulance' && '🚑'}
                    {key === 'touristHelpline' && '📞'}
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ 
                    fontSize: "16px",
                    color: "#00F0FF"
                  }}>{contact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating geometric shapes background elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "100px",
        height: "100px",
        background: "rgba(0, 240, 255, 0.1)",
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        zIndex: "-1"
      }}></div>
      
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "15%",
        width: "80px",
        height: "80px",
        background: "rgba(0, 240, 255, 0.1)",
        borderRadius: "50%",
        zIndex: "-1"
      }}></div>
    </div>
  );
};

export default DailyItineraryScreen;