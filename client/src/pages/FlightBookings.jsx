import axios from 'axios';
import React, { useEffect, useState } from 'react'

// Safe date formatting utility
const formatTimeSafely = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleTimeString();
  } catch (error) {
    return 'Invalid time';
  }
};

const FlightBookings = () => {
  const [userDetails, setUserDetails] = useState('');
  const [bookings, setBookings] = useState([]);

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

  useEffect(() => {
    const fetchBookings = async () => {
      const operatorId = localStorage.getItem('userId');
      await axios.get(`http://localhost:6001/fetch-operator-bookings/${operatorId}`).then(
        (response) => {
          setBookings(response.data);
        }
      )
    };
    fetchBookings();
  }, [])

  const cancelTicket = async (id) => {
    await axios.put(`http://localhost:6001/cancel-ticket/${id}`).then(
      (response) => {
        alert("The ticket has been cancelled successfully! The money will be refunded in 2-3 working days.");
        const fetchBookings = async () => {
          const operatorId = localStorage.getItem('userId');
          await axios.get(`http://localhost:6001/fetch-operator-bookings/${operatorId}`).then(
            (response) => {
              setBookings(response.data);
            }
          )
        };
        fetchBookings();
      }
    )
  }

  return (
    <div className='allBookingsPage'>
      {userDetails ?
        <>
          {userDetails.usertype === 'flight-operator' && userDetails.approval === 'approved' ?
            <>
              <h1>Flight Bookings</h1>
              <div className="allBookings">
                {bookings.length === 0 ? <p>No bookings found.</p> : bookings.map((booking) => {
                  return (
                    <div className="allBookings-booking" key={booking._id}>
                      <p><b>Booking Id:</b> {booking._id}</p>
                      <span>
                        <p><b>User:</b> {booking.userEmail}</p>
                        <p><b>Flight:</b> {booking.flightName} ({booking.flightId})</p>
                      </span>
                      <span>
                        <p><b>Origin:</b> {booking.departure}</p>
                        <p><b>Destination:</b> {booking.destination}</p>
                      </span>
                      <p><b>Passengers:</b></p>
                      <ul>
                        {booking.passengers.map((passenger, index) => (
                          <li key={index}>{passenger.name} ({passenger.age})</li>
                        ))}
                      </ul>
                      <span>
                        <div className="d-flex" style={{ gap: "10px", alignItems: "center" }}>
                          <p><b>Coach:</b> {booking.seatClass}</p>
                          <p style={{ margin: "0px", padding: "0px" }}><b>Total Price:</b> {booking.totalPrice}</p>
                        </div>
                        {booking.bookingStatus === 'confirmed' ? <p><b>Seats:</b> {booking.seats}</p> : ""}
                      </span>
                      <span>
                        <p><b>Journey Time:</b> {booking.journeyTime}</p>
                        <p><b>Total price:</b> {booking.totalPrice}</p>
                      </span>
                      {booking.bookingStatus === 'cancelled' ?
                        <p style={{ color: "red" }}><b>Booking status:</b> {booking.bookingStatus}</p>
                        :
                        <p><b>Booking status:</b> {booking.bookingStatus}</p>
                      }
                      {booking.bookingStatus === 'confirmed' ?
                        <div>
                          <button className="btn btn-danger" onClick={() => cancelTicket(booking._id)}>Cancel Ticket</button>
                        </div>
                        :
                        <></>}
                    </div>
                  )
                })}
              </div>
            </>
            :
            ""
          }
        </>
        :
        ""
      }
    </div>
  )
}

export default FlightBookings