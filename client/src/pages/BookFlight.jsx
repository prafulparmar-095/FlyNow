import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GeneralContext } from '../context/GeneralContext';
import '../styles/BookFlight.css';

// Safe date formatting utility
const formatTimeSafely = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleTimeString();
  } catch (error) {
    return 'Invalid time';
  }
};

const BookFlight = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ticketBookingDate } = useContext(GeneralContext);

    const [flightDetails, setFlightDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingInputs, setBookingInputs] = useState({
        email: '',
        mobile: '',
        coachType: '',
        numberOfPassengers: 0,
        passengerDetails: [],
        journeyDate: ticketBookingDate || new Date().toISOString().slice(0, 10),
    });
    const [totalPrice, setTotalPrice] = useState(0);

    const { email, mobile, coachType, numberOfPassengers, passengerDetails, journeyDate } = bookingInputs;

    const fetchFlightData = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:6001/fetch-flight/${id}`);
            setFlightDetails(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch flight data:", error);
            toast.error("Failed to fetch flight details. Please try again.");
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFlightData();
    }, [fetchFlightData]);

    useEffect(() => {
        if (flightDetails) {
            const price = coachType === 'economy' ? flightDetails.basePrice :
                coachType === 'business' ? flightDetails.basePrice * 1.5 :
                0;
            setTotalPrice(price * numberOfPassengers);
        }
    }, [coachType, numberOfPassengers, flightDetails]);

    const handleBookingInputs = (event) => {
        const { name, value } = event.target;
        setBookingInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePassengerDetailsChange = (index, field, value) => {
        const newPassengers = [...passengerDetails];
        if (!newPassengers[index]) {
            newPassengers[index] = {};
        }
        newPassengers[index][field] = value;
        setBookingInputs(prev => ({
            ...prev,
            passengerDetails: newPassengers
        }));
    };

    const handleBooking = async (event) => {
        event.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error("Please log in to book a flight.");
            navigate('/auth');
            return;
        }

        const data = {
            user: userId,
            flight: id,
            email,
            mobile,
            seatClass: coachType,
            numberOfPassengers,
            passengers: passengerDetails,
            totalPrice,
            journeyDate: journeyDate,
            journeyTime: formatTimeSafely(flightDetails.departureTime)
        };

        // Store booking data in localStorage for payment page
        localStorage.setItem('pendingBooking', JSON.stringify(data));
        navigate('/payment');
    };

    if (loading) {
        return <div className="loading-state">Loading flight details...</div>;
    }

    if (!flightDetails) {
        return <div className="no-data-state">No flight details found.</div>;
    }

    const { flightName, flightId, origin, destination, departureTime, arrivalTime, totalSeats } = flightDetails;

    return (
        <div className='bookFlightPage'>
            <div className="booking-form-container">
                <h1>Book Your Flight</h1>
                <div className="flight-details">
                    <p><b>Flight:</b> {flightName} ({flightId})</p>
                    <p><b>Route:</b> {origin} to {destination}</p>
                    <p><b>Departure Time:</b> {formatTimeSafely(departureTime)}</p>
                    <p><b>Arrival Time:</b> {formatTimeSafely(arrivalTime)}</p>
                </div>

                <form className="booking-form" onSubmit={handleBooking}>
                    <div className="contact-details-inputs">
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="floatingInputEmail" name="email" value={email} onChange={handleBookingInputs} required />
                            <label htmlFor="floatingInputEmail">Email</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="tel" className="form-control" id="floatingInputMobile" name="mobile" value={mobile} onChange={handleBookingInputs} required />
                            <label htmlFor="floatingInputMobile">Mobile</label>
                        </div>
                    </div>

                    <div className="booking-options">
                        <div className="form-floating mb-3">
                            <select className="form-select" id="floatingSelectCoach" name="coachType" value={coachType} onChange={handleBookingInputs} required>
                                <option value="">Select coach type</option>
                                <option value="economy">Economy</option>
                                <option value="business">Business</option>
                            </select>
                            <label htmlFor="floatingSelectCoach">Coach Type</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="number" className="form-control" id="floatingInputPassengers" name="numberOfPassengers" value={numberOfPassengers} onChange={handleBookingInputs} min="1" max={totalSeats} required />
                            <label htmlFor="floatingInputPassengers">Number of passengers</label>
                        </div>
                    </div>
                    
                    <div className="passenger-details-section">
                        {Array.from({ length: numberOfPassengers }, (_, index) => (
                            <div key={index} className="passenger-card">
                                <h4>Passenger {index + 1}</h4>
                                <div className="new-passenger-inputs">
                                    <div className="form-floating mb-3">
                                        <input type="text" className="form-control" id={`passenger-name-${index}`} value={passengerDetails[index]?.name || ''} onChange={(event) => handlePassengerDetailsChange(index, 'name', event.target.value)} required />
                                        <label htmlFor={`passenger-name-${index}`}>Name</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="number" className="form-control" id={`passenger-age-${index}`} value={passengerDetails[index]?.age || ''} onChange={(event) => handlePassengerDetailsChange(index, 'age', event.target.value)} min="1" required />
                                        <label htmlFor={`passenger-age-${index}`}>Age</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="total-price-section">
                        <h6><b>Total price</b>: ₹{totalPrice.toFixed(2)}</h6>
                        <button type="submit" className='btn btn-primary'>Book Now</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookFlight;