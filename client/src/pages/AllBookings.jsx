import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Safe date formatting utility
const formatTimeSafely = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleTimeString();
  } catch (error) {
    return 'Invalid time';
  }
};

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:6001/fetch-bookings');
            setBookings(response.data.reverse());
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const cancelTicket = async (id) => {
        try {
            const response = await axios.put(`http://localhost:6001/cancel-ticket/${id}`);
            if (response.status === 200) {
                toast.success('The ticket has been cancelled successfully! The money will be refunded in 2-3 working days.');
                fetchBookings();
            }
        } catch (err) {
            console.error('Cancellation failed:', err);
            toast.error('Ticket cancellation failed. Please try again.');
        }
    };

    if (loading) {
        return <div className="loading-state">Loading your bookings...</div>;
    }

    if (bookings.length === 0) {
        return <div className="no-bookings-state">No bookings found.</div>;
    }

    return (
        <div className="allBookingsPage">
            <h1>All Bookings</h1>
            <div className="allBookings">
                {bookings.map(booking => (
                    <div className="allBookings-booking" key={booking._id}>
                        <p><b>Booking ID:</b> {booking._id}</p>
                        <p><b>User:</b> {booking.userEmail}</p>
                        <p><b>Flight:</b> {booking.flightName} ({booking.flightId})</p>
                        <span>
                            <p><b>Origin:</b> {booking.departure}</p>
                            <p><b>Destination:</b> {booking.destination}</p>
                        </span>
                        <span>
                            <p><b>Passengers:</b> {booking.passengers.length}</p>
                            {booking.bookingStatus === 'confirmed' && booking.seats && <p><b>Seats:</b> {booking.seats}</p>}
                        </span>
                        <span>
                            <p><b>Journey Time:</b> {booking.journeyTime}</p>
                            <p><b>Total price:</b> {booking.totalPrice}</p>
                        </span>
                        <p style={{ color: booking.bookingStatus === 'cancelled' ? 'red' : 'inherit' }}>
                            <b>Booking status:</b> {booking.bookingStatus}
                        </p>
                        {booking.bookingStatus === 'confirmed' && (
                            <div>
                                <button className="btn btn-danger" onClick={() => cancelTicket(booking._id)}>
                                    Cancel Ticket
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllBookings;