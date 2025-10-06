import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles/AllFlights.css';
import { useNavigate } from 'react-router-dom';

// Safe date formatting utility
const formatTimeSafely = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleTimeString();
  } catch (error) {
    return 'Invalid time';
  }
};

const AllFlights = () => {
  const [flights, setFlights] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-flights');
      setFlights(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching flights:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const id = localStorage.getItem('userId');
      if (id) {
        const response = await axios.get(`http://localhost:6001/fetch-user/${id}`);
        setUserDetails(response.data);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchFlights(), fetchUserData()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const deleteFlight = async (id) => {
    if (window.confirm("Are you sure you want to delete this flight?")) {
      try {
        await axios.delete(`http://localhost:6001/delete-flight/${id}`);
        alert("Flight deleted successfully!");
        fetchFlights();
      } catch (err) {
        console.error("Error deleting flight:", err);
        alert("Failed to delete flight. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="loading-message">Loading flights...</div>;
  }

  return (
    <div className="allFlightsPage">
      <h1>All Flights</h1>
      
      {userDetails && userDetails.usertype === 'admin' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/new-flight')}
          >
            Add New Flight
          </button>
        </div>
      )}

      <div className="allFlights">
        {flights.length > 0 ? (
          flights.map((flight) => (
            <div className="allFlights-Flight" key={flight._id}>
              <p><b>_id:</b> {flight._id}</p>
              <span>
                <p><b>Flight Id:</b> {flight.flightId}</p>
                <p><b>Flight name:</b> {flight.flightName}</p>
              </span>
              <span>
                <p><b>Starting station:</b> {flight.origin}</p>
                <p><b>Departure time:</b> {formatTimeSafely(flight.departureTime)}</p>
              </span>
              <span>
                <p><b>Destination:</b> {flight.destination}</p>
                <p><b>Arrival time:</b> {formatTimeSafely(flight.arrivalTime)}</p>
              </span>
              <span>
                <p><b>Base price:</b> {flight.basePrice}</p>
                <p><b>Total seats:</b> {flight.totalSeats}</p>
              </span>
              
              {userDetails && userDetails.usertype === 'admin' && (
                <button className="btn btn-danger" onClick={() => deleteFlight(flight._id)}>
                  Delete Flight
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No flights found.</p>
        )}
      </div>
    </div>
  );
};

export default AllFlights;