import React, { useEffect, useState } from 'react'
import '../styles/NewFlight.css'
import axios from 'axios';

const NewFlight = () => {


  const [userDetails, setUserDetails] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [])

  const fetchUserData = async () => {
    try {
      const id = localStorage.getItem('userId');
      await axios.get(`http://localhost:6001/fetch-user/${id}`).then(
        (response) => {
          setUserDetails(response.data);
          console.log(response.data);
        }
      )

    } catch (err) {

    }
  }



  const [flightName, setFlightName] = useState('');

  const [flightId, setFlightId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startTime, setStartTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [totalSeats, setTotalSeats] = useState(0);
  const [basePrice, setBasePrice] = useState(0);

  const handleSubmit = async () => {

    const inputs = {
      flightName, flightId, origin, destination,
      departureTime: new Date(startTime),
      arrivalTime: new Date(arrivalTime), basePrice, totalSeats, createdBy: localStorage.getItem('userId')
    };
    try {
      await axios.post('http://localhost:6001/add-Flight', inputs);
      alert('Flight added successfully!!');
      setFlightName('');
      setFlightId('');
      setOrigin('');
      setDestination('');
      setStartTime('');
      setArrivalTime('');
      setTotalSeats(0);
      setBasePrice(0);
    } catch (err) {
      console.error(err);
      alert('Failed to add flight!!');
    }

  }


  return (
    <div className='newFlightPage'>
      {userDetails && userDetails.usertype === 'admin' ?
        <>
          <div className="newFlight-card">
            <h1>Add a new Flight</h1>
            <span className='newFlightSpan1'>
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="floatingInputFlightname" value={flightName} onChange={(e) => setFlightName(e.target.value)} />
                <label htmlFor="floatingInputFlightname">Flight name</label>
              </div>
              <div className="form-floating mb-3">
                <input type="text" className="form-control" id="floatingInputFlightid" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
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
                    ))}
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

            <button className='btn btn-primary' onClick={handleSubmit}>Add now</button>
          </div>
        </>
        :
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Access Denied</h2>
          <p>You must be an admin to add new flights.</p>
        </div>
      }


    </div>
  )
}

export default NewFlight;