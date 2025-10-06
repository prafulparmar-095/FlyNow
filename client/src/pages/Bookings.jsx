import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/Bookings.css';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';



const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchParams] = useSearchParams();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!userId) {
                return;
            }
            try {
                const response = await axios.get(`http://localhost:6001/fetch-user-bookings/${userId}`);
                setBookings(response.data.reverse());
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };
        fetchBookings();
    }, [userId]);

    useEffect(() => {
        if (searchParams.get('confirmed') === 'true') {
            toast.success('🎉 Booking confirmed! Your flight has been booked successfully.');
            // Optionally, clear the query param by navigating without it
            window.history.replaceState(null, null, window.location.pathname);
        }
    }, [searchParams]);

    const cancelTicket = async (id) => {
        try {
            await axios.put(`http://localhost:6001/cancel-ticket/${id}`);
            alert("The ticket has been cancelled successfully! The money will be refunded in 2-3 working days.");
            if (userId) {
                const response = await axios.get(`http://localhost:6001/fetch-user-bookings/${userId}`);
                setBookings(response.data.reverse());
            }
        } catch (error) {
            console.error("Error canceling ticket:", error);
        }
    };

    return (
        <div className="user-bookingsPage">
            <h1>Your Bookings</h1>
            <div className="user-bookings">
                {bookings.length > 0 ? (
                    bookings.map((booking) => {
                        if (!booking) {
                            return null;
                        }
                        const qrData = JSON.stringify({
                            bookingId: booking._id,
                            flight: booking.flightId,
                            from: booking.departure,
                            to: booking.destination,
                            passengerName: booking.passengers && booking.passengers.length > 0 ? booking.passengers[0].name : 'N/A',
                        });

                        return (
                            <div className="booking-card" key={booking._id}>
                                <div className="booking-info">
                                    <p><b>Booking Id:</b> {booking._id}</p>
                                    <span>
                                        <p><b>Flight name:</b> {booking.flightName}</p>
                                        <p><b>Flight Id:</b> {booking.flightId}</p>
                                    </span>
                                    <span>
                                        <p><b>Origin:</b> {booking.departure}</p>
                                        <p><b>Destination:</b> {booking.destination}</p>
                                    </span>
                                    <span>
                                        <p><b>Journey Date:</b> {booking.journeyDate ? booking.journeyDate.slice(0, 10) : 'N/A'}</p>
                                        <p><b>Journey Time:</b> {booking.journeyTime}</p>
                                    </span>
                                    <p><b>Passengers:</b></p>
                                    <ul>
                                        {booking.passengers.map((passenger, index) => (
                                            <li key={index}>{passenger.name} ({passenger.age})</li>
                                        ))}
                                    </ul>
                                    <p><b>Coach:</b> {booking.seatClass}</p>
                                    {booking.seats && (
                                        <p><b>Seats:</b> {booking.seats}</p>
                                    )}
                                    {booking.bookingStatus === 'cancelled' ? (
                                        <p style={{ color: "red" }}><b>Booking Status:</b> {booking.bookingStatus}</p>
                                    ) : (
                                        <p><b>Booking Status:</b> {booking.bookingStatus}</p>
                                    )}
                                </div>
                                
                                <div className="qr-code">
                                    <QRCodeCanvas value={qrData} size={100} />
                                    <p>Scan for details</p>
                                </div>

                                {booking.bookingStatus === 'confirmed' && (
                                    <div className="cancel-button-container">
                                        <button className="btn btn-danger" onClick={() => cancelTicket(booking._id)}>
                                            Cancel Ticket
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>No bookings found.</p>
                )}
            </div>
        </div>
    );
};

export default Bookings;