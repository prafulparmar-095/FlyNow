import React, { useEffect, useState } from 'react'
import '../styles/NewFlight.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EditFlight = () => {
  const [flightName, setFlightName] = useState('');
  const [flightId, setFlightId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startTime, setStartTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [totalSeats, setTotalSeats] = useState(0);
  const [basePrice, setBasePrice] = useState(0);

  const { id } = useParams();

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        const response = await axios.get(`http://localhost:6001/fetch-flight/${id}`);
        const data = response.data;

        setFlightName(data.flightName);
        setFlightId(data.flightId);
        setOrigin(data.origin);
        setDestination(data.destination);
        setTotalSeats(data.totalSeats);
        setBasePrice(data.basePrice);

        // ✅ Format for datetime-local input
        setStartTime(new Date(data.departureTime).toISOString().substring(0, 16));
        setArrivalTime(new Date(data.arrivalTime).toISOString().substring(0, 16));
      } catch (error) {
        console.error("Error fetching flight:", error);
      }
    };

    fetchFlightData();
  }, [id]); // depends only on id

  const handleSubmit = async () => {
    const inputs = {
      flightName, flightId, origin, destination,
      departureTime: new Date(startTime),
      arrivalTime: new Date(arrivalTime),
      basePrice, totalSeats
    };
    try {
      await axios.put(`http://localhost:6001/edit-flight/${id}`, inputs);
      alert('Flight updated successfully!!');
    } catch (err) {
      console.error(err);
      alert('Failed to update flight!!');
    }
  };

  return (
    <div className='newFlightPage'>
      <div className="newFlight-card">
        <h1>Edit Flight details</h1>
        <span className='newFlightSpan1'>
          <div className="form-floating mb-3">
            <input type="text" className="form-control" id="floatingInputFlightname" value={flightName} onChange={(e) => setFlightName(e.target.value)} />
            <label htmlFor="floatingInputFlightname">Flight name</label>
          </div>
          <div className="form-floating mb-3">
            <input type="text" className="form-control" id="floatingInputFlightid" value={flightId} onChange={(e) => setFlightId(e.target.value)} disabled />
            <label htmlFor="floatingInputFlightid">Flight id</label>
          </div>
        </span>
        <span className='newFlightSpan2'>
          <div className="form-floating mb-3">
            <select className="form-select" id="floatingSelect" value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="">Select city</option>
              {["Mumbai", "Delhi", "Hyderabad", "Bengaluru", "Chennai", "Kochi", "Goa", "Ahmedabad", "Pune", "Trivandrum", "Bhopal", "Kolkata", "Varanasi", "Jaipur", "New York", "London", "Dubai", "Singapore", "Tokyo", "Paris", "Toronto", "Frankfurt", "Doha", "Sydney", "Bangkok", "Kuala Lumpur"].map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <label htmlFor="floatingSelect">Origin City</label>
          </div>
          <div className="form-floating mb-3">
            <input type="datetime-local" className="form-control" id="floatingInputDepartureTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <label htmlFor="floatingInputDepartureTime">Departure time</label>
          </div>
        </span>
        <span className='newFlightSpan2'>
          <div className="form-floating mb-3">
            <select className="form-select" id="floatingSelect" value={destination} onChange={(e) => setDestination(e.target.value)}>
              <option value="">Select city</option>
              {["Mumbai", "Delhi", "Hyderabad", "Bengaluru", "Chennai", "Kochi", "Goa", "Ahmedabad", "Pune", "Trivandrum", "Bhopal", "Kolkata", "Varanasi", "Jaipur", "New York", "London", "Dubai", "Singapore", "Tokyo", "Paris", "Toronto", "Frankfurt", "Doha", "Sydney", "Bangkok", "Kuala Lumpur"]
                .map((city) => (
                  <option key={city} value={city}>{city}</option>
              ))}\
            </select>
            <label htmlFor="floatingSelect">Destination City</label>
          </div>
          <div className="form-floating mb-3">
            <input type="datetime-local" className="form-control" id="floatingInputArrivalTime" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
            <label htmlFor="floatingInputArrivalTime">Arrival time</label>
          </div>
        </span>
        <span className='newFlightSpan2'>
          <div className="form-floating mb-3">
            <input type="number" className="form-control" id="floatingInpuSeats" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
            <label htmlFor="floatingInpuSeats">Total seats</label>
          </div>
          <div className="form-floating mb-3">
            <input type="number" className="form-control" id="floatingInputBasePrice" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
            <label htmlFor="floatingInputBasePrice">Base price</label>
          </div>
        </span>
        <button className='btn btn-primary' onClick={handleSubmit}>Update</button>
      </div>
    </div>
  )
}

export default EditFlight;