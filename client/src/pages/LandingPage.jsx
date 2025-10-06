import React, { useCallback, useContext, useEffect, useState } from "react";
import "../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GeneralContext } from "../context/GeneralContext";

const LandingPage = () => {
  const [error, setError] = useState("");
  const [checkBox, setCheckBox] = useState(false);
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [Flights, setFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [airports, setAirports] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(false);

  // Search suggestion states
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const navigate = useNavigate();
  const { setBookingDate } = useContext(GeneralContext);
  const userId = localStorage.getItem("userId");

  // ✅ FIXED: Correct AirportDB API URL format
  const fetchAirports = useCallback(async () => {
    setLoadingAirports(true);
    try {
      // Using AirportDB's search endpoint instead of direct airport codes
      const response = await axios.get(
        `https://airportdb.io/api/v1/airport/search?apiToken=2527707f9930498cd35d01d771379dcddad6b8930c995acd9a7a5625e8ed7b2b03f152302b38ea3fd0cd21e61bf4344b03f152302b38ea3fd0cd21e61bf4344b&limit=50`,
        { timeout: 10000 }
      );
      
      if (response.data && response.data.data) {
        const airportData = response.data.data.map(airport => ({
          name: airport.name,
          iataCode: airport.iata_code,
          city: airport.municipality || airport.name.split(' ')[0],
          country: airport.country_name
        }));
        setAirports(airportData);
        console.log("Airports loaded:", airportData.length);
      } else {
        setAirports(getFallbackAirports());
      }
      
    } catch (error) {
      console.error("Failed to fetch airports:", error);
      setAirports(getFallbackAirports());
      setError("Using cached airport data - API temporarily unavailable");
    } finally {
      setLoadingAirports(false);
    }
  }, []);

  // Fallback airports in case API fails
  const getFallbackAirports = () => {
    return [
      { name: "John F Kennedy International Airport", iataCode: "JFK", city: "New York", country: "United States" },
      { name: "Los Angeles International Airport", iataCode: "LAX", city: "Los Angeles", country: "United States" },
      { name: "Heathrow Airport", iataCode: "LHR", city: "London", country: "United Kingdom" },
      { name: "Charles de Gaulle Airport", iataCode: "CDG", city: "Paris", country: "France" },
      { name: "Frankfurt Airport", iataCode: "FRA", city: "Frankfurt", country: "Germany" },
      { name: "Amsterdam Schiphol Airport", iataCode: "AMS", city: "Amsterdam", country: "Netherlands" },
      { name: "Dubai International Airport", iataCode: "DXB", city: "Dubai", country: "United Arab Emirates" },
      { name: "Singapore Changi Airport", iataCode: "SIN", city: "Singapore", country: "Singapore" },
      { name: "Tokyo Haneda Airport", iataCode: "HND", city: "Tokyo", country: "Japan" },
      { name: "Sydney Kingsford Smith Airport", iataCode: "SYD", city: "Sydney", country: "Australia" },
      { name: "Indira Gandhi International Airport", iataCode: "DEL", city: "Delhi", country: "India" },
      { name: "Chhatrapati Shivaji Maharaj International Airport", iataCode: "BOM", city: "Mumbai", country: "India" },
      { name: "Rajiv Gandhi International Airport", iataCode: "HYD", city: "Hyderabad", country: "India" },
      { name: "Kempegowda International Airport", iataCode: "BLR", city: "Bangalore", country: "India" },
      { name: "Chennai International Airport", iataCode: "MAA", city: "Chennai", country: "India" },
      { name: "Netaji Subhas Chandra Bose International Airport", iataCode: "CCU", city: "Kolkata", country: "India" },
      { name: "Pune International Airport", iataCode: "PNQ", city: "Pune", country: "India" },
      { name: "Goa International Airport", iataCode: "GOI", city: "Goa", country: "India" },
      { name: "Cochin International Airport", iataCode: "COK", city: "Kochi", country: "India" },
      { name: "Trivandrum International Airport", iataCode: "TRV", city: "Trivandrum", country: "India" }
    ];
  };

  // ✅ FIXED: Fetch flights and airports with proper dependency array
  useEffect(() => {
    const fetchAllFlights = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:6001/fetch-flights", {
          timeout: 10000
        });
        
        console.log("API Response:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setAllFlights(response.data);
          setError("");
        } else {
          setAllFlights([]);
          setError("Unexpected data format from server");
        }
      } catch (error) {
        console.error("Failed to fetch all flights:", error);
        setError("Failed to load flights. Please check if server is running.");
        setAllFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFlights();
    fetchAirports(); // Load airports when component mounts
  }, []); // ✅ fetchAirports is now memoized, no need for dependency

  useEffect(() => {
    if (allFlights.length > 0) {
      const featured = allFlights.slice(0, 3);
      setFeaturedFlights(featured);
    }
  }, [allFlights]);

  // ✅ FIXED: Filter airports based on search input
  const filterAirports = (searchTerm, type) => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    
    const filtered = airports.filter(airport =>
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (airport.iataCode && airport.iataCode.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5);
    
    return filtered;
  };

  // ✅ FIXED: Handle departure input change
  const handleDepartureChange = (e) => {
    const value = e.target.value;
    setDeparture(value);
    
    if (value.length > 1) {
      const suggestions = filterAirports(value, 'departure');
      setDepartureSuggestions(suggestions);
      setShowDepartureSuggestions(true);
    } else {
      setShowDepartureSuggestions(false);
    }
  };

  // ✅ FIXED: Handle destination input change
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    
    if (value.length > 1) {
      const suggestions = filterAirports(value, 'destination');
      setDestinationSuggestions(suggestions);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  // ✅ FIXED: Handle airport selection from suggestions
  const handleAirportSelect = (airport, type) => {
    if (type === 'departure') {
      setDeparture(airport.city);
      setShowDepartureSuggestions(false);
    } else {
      setDestination(airport.city);
      setShowDestinationSuggestions(false);
    }
  };

  // ✅ FIXED: Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.input-container')) {
        setShowDepartureSuggestions(false);
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // ✅ FIXED: Safe date formatting utility
  const formatDateSafely = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  // ✅ FIXED: Safe time formatting utility
  const formatTimeSafely = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // ✅ UPDATED: Improved flight search function
  const fetchFlights = async () => {
    setFlights([]);
    setError("");

    // Validation for one-way trip
    if (!checkBox) {
      if (!departure || !destination || !departureDate) {
        setError("Please fill all the details for departure");
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDepartureDate = new Date(departureDate);
      
      if (selectedDepartureDate < today) {
        setError("Please select a valid future date for departure");
        return;
      }
    } 
    // Validation for round trip
    else {
      if (!departure || !destination || !departureDate || !returnDate) {
        setError("Please fill all the details for round trip");
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDepartureDate = new Date(departureDate);
      const selectedReturnDate = new Date(returnDate);
      
      if (selectedDepartureDate < today || selectedReturnDate < today || selectedDepartureDate > selectedReturnDate) {
        setError("Please select valid dates (departure must be before return and both must be future dates)");
        return;
      }
    }

    setBookingDate(departureDate);
    setLoading(true);

    try {
      // Use the search API
      const searchParams = {
        origin: departure,
        destination: destination,
        departureDate: departureDate
      };
      
      console.log("Searching flights with params:", searchParams);
      
      const response = await axios.post("http://localhost:6001/search-flights", searchParams, {
        timeout: 10000
      });
      
      console.log("Search response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setFlights(response.data);
        if (response.data.length === 0) {
          setError("No flights found for your search criteria. Try different dates or routes.");
        } else {
          setError("");
        }
      } else {
        setFlights([]);
        setError("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Search flights error:", error);
      
      // Fallback to client-side filtering if API fails
      try {
        const formattedDepartureDate = departureDate;
        const filteredFlights = allFlights.filter(flight => {
          try {
            if (!flight.origin || !flight.destination || !flight.departureTime) {
              return false;
            }
            
            const flightDepartureDate = formatDateSafely(flight.departureTime);
            const matchesOrigin = flight.origin.toLowerCase().includes(departure.toLowerCase());
            const matchesDestination = flight.destination.toLowerCase().includes(destination.toLowerCase());
            const matchesDate = flightDepartureDate === formattedDepartureDate;
            
            return matchesOrigin && matchesDestination && matchesDate;
          } catch (filterError) {
            console.error('Error processing flight:', flight._id, filterError);
            return false;
          }
        });

        setFlights(filteredFlights);
        
        if (filteredFlights.length === 0) {
          setError("No flights found for your search criteria. Try different dates or routes.");
        } else {
          setError("Search completed using local filtering");
        }
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        setError("Failed to search flights. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleTicketBooking = (id) => {
    if (userId) {
      navigate(`/book-flight/${id}`);
    } else {
      localStorage.setItem('pendingFlightId', id);
      navigate("/auth");
    }
  };

  return (
    <div className="LandingPage">
      <div className="hero-section">
        <h1>Book the Skies and Chase Your Travel Dreams!</h1>
        <p>Fly beyond limits and book your dreams through extraordinary flight journeys that take you to unforgettable destinations — igniting a sense of adventure like never before</p>
        
        <div className="search-form-container">
          <div className="search-inputs-left">
            {loading && <p className="loading-message">Loading flights...</p>}
            {loadingAirports && <p className="loading-message">Loading airports...</p>}
            {error && <p className="error-message">{error}</p>}
            
            <div className="search-inputs">
              <div className="input-container">
                <input
                  type="text"
                  placeholder="From: City or Airport"
                  value={departure}
                  onChange={handleDepartureChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (departure.length > 1) {
                      setShowDepartureSuggestions(true);
                    }
                  }}
                />
                {showDepartureSuggestions && departureSuggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {departureSuggestions.map((airport, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleAirportSelect(airport, 'departure')}
                      >
                        <div className="airport-name">{airport.name}</div>
                        <div className="airport-details">
                          {airport.city} ({airport.iataCode}) - {airport.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-container">
                <input
                  type="text"
                  placeholder="To: City or Airport"
                  value={destination}
                  onChange={handleDestinationChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (destination.length > 1) {
                      setShowDestinationSuggestions(true);
                    }
                  }}
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {destinationSuggestions.map((airport, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleAirportSelect(airport, 'destination')}
                      >
                        <div className="airport-name">{airport.name}</div>
                        <div className="airport-details">
                          {airport.city} ({airport.iataCode}) - {airport.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="date"
                placeholder="Departure Date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {checkBox && (
                <input
                  type="date"
                  placeholder="Return Date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departureDate || new Date().toISOString().split('T')[0]}
                />
              )}
              <button className="btn btn-primary" onClick={fetchFlights} disabled={loading || loadingAirports}>
                {loading ? 'Searching...' : 'Search Flights'}
              </button>
            </div>
            <div className="search-options">
              <input
                type="checkbox"
                id="roundTrip"
                checked={checkBox}
                onChange={(e) => setCheckBox(e.target.checked)}
              />
              <label htmlFor="roundTrip">Round Trip</label>
            </div>
          </div>
        </div>
      </div>

      {featuredFlights.length > 0 && (
        <div className="featuredFlights">
          <div className="availableFlightsContainer">
            <h1>Featured Flights</h1>
            <div className="flights">
              {featuredFlights.map((Flight) => (
                <div className="flight-card" key={Flight._id}>
                  <h3>{Flight.flightName} ({Flight.flightId})</h3>
                  <div>
                    <p>
                      <b>Origin:</b> {Flight.origin}
                    </p>
                    <p>
                      <b>Departure Time:</b> {formatTimeSafely(Flight.departureTime)}
                    </p>
                  </div>
                  <div>
                    <p>
                      <b>Destination :</b> {Flight.destination}
                    </p>
                    <p>
                      <b>Arrival Time:</b> {formatTimeSafely(Flight.arrivalTime)}
                    </p>
                  </div>
                  <div>
                    <p>
                      <b>Starting Price:</b> ₹{Flight.basePrice}
                    </p>
                    <p>
                      <b>Available Seats:</b> {Flight.totalSeats}
                    </p>
                  </div>
                  <button
                    className="button btn btn-primary"
                    onClick={() => handleTicketBooking(Flight._id)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="availableFlights">
        {Flights.length > 0 ? (
          <div className="availableFlightsContainer">
            <h1>Available Flights</h1>
            <div className="flights">
              {Flights.map((Flight) => (
                <div className="flight-card" key={Flight._id}>
                  <h3>{Flight.flightName} ({Flight.flightId})</h3>
                  <div>
                    <p>
                      <b>Origin:</b> {Flight.origin}
                    </p>
                    <p>
                      <b>Departure Time:</b> {formatTimeSafely(Flight.departureTime)}
                    </p>
                  </div>
                  <div>
                    <p>
                      <b>Destination :</b> {Flight.destination}
                    </p>
                    <p>
                      <b>Arrival Time:</b> {formatTimeSafely(Flight.arrivalTime)}
                    </p>
                  </div>
                  <div>
                    <p>
                      <b>Starting Price:</b> ₹{Flight.basePrice}
                    </p>
                    <p>
                      <b>Available Seats:</b> {Flight.totalSeats}
                    </p>
                  </div>
                  <button
                    className="button btn btn-primary"
                    onClick={() => handleTicketBooking(Flight._id)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="availableFlightsContainer">
            <h1>Search for Flights</h1>
            <p>Enter your departure and destination cities to find available flights.</p>
          </div>
        )}
      </div>

      <section id="about" className="section-about p-4">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          <p className="section-description">
            Welcome to our Flight ticket booking app, where we are dedicated to providing you with an
            exceptional travel experience from start to finish.
          </p>
          <span>
            <h5>2025 <i>Fly-Now</i> - &copy; All rights reserved</h5>
          </span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;