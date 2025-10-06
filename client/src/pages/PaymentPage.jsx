import React, { useState, useEffect } from 'react';
import '../styles/PaymentPage.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });

  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit');

  // Added onChange handler for radio inputs to fix selection issue
  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => {
    const bookingData = localStorage.getItem('pendingBooking');
    if (bookingData) {
      setPendingBooking(JSON.parse(bookingData));
    } else {
      // No pending booking, redirect back
      navigate('/flights');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // ✅ UPDATED: Add validation and formatting for card number, cvv, and expiry
    if (name === 'cardNumber' || name === 'cvv') {
      // Allow only digits (0-9)
      formattedValue = value.replace(/\D/g, '');
    } else if (name === 'expiry') {
      // Remove any non-digit characters
      const cleanedValue = value.replace(/\D/g, '');
      
      // Automatically add a slash after the first two digits (MM)
      if (cleanedValue.length > 2) {
        formattedValue = cleanedValue.slice(0, 2) + '/' + cleanedValue.slice(2, 4);
      } else {
        formattedValue = cleanedValue;
      }
    }

    setPaymentDetails({
      ...paymentDetails,
      [name]: formattedValue,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        if (pendingBooking) {
          await axios.post('http://localhost:6001/add-booking', pendingBooking);
          localStorage.removeItem('pendingBooking');
          setLoading(false);
          toast.success('Payment and Booking Successful!', {
            onClose: () => navigate('/bookings?confirmed=true')
          });
        } else {
          throw new Error('No booking data found');
        }
      } catch (error) {
        console.error("Booking failed:", error);
        setLoading(false);
        toast.error("Booking failed. Please try again.");
      }
    }, selectedPaymentMethod === 'netbanking' ? 1000 : 2000);
  };

  return (
    <div className="payment-page">
      <h1>Complete Your Payment</h1>
      <form onSubmit={handlePayment} className="payment-form">
        <div className="payment-methods">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="credit"
              checked={selectedPaymentMethod === 'credit'}
              onChange={handlePaymentMethodChange}
            />{' '}
            Credit Card
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="debit"
              checked={selectedPaymentMethod === 'debit'}
              onChange={handlePaymentMethodChange}
            />{' '}
            Debit Card
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={selectedPaymentMethod === 'upi'}
              onChange={handlePaymentMethodChange}
            />{' '}
            UPI
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="netbanking"
              checked={selectedPaymentMethod === 'netbanking'}
              onChange={handlePaymentMethodChange}
            />{' '}
            Net Banking
          </label>
        </div>

        {(selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'debit') && (
          <div style={{ textAlign: 'center' }}>
            <input
              type="text"
              name="name"
              placeholder="Cardholder Name"
              value={paymentDetails.name}
              onChange={handleChange}
              required
            /><br /><br />
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              maxLength="16"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              required
            /><br /><br />
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              maxLength="5"
              value={paymentDetails.expiry}
              onChange={handleChange}
              required
            /><br /><br />
            <input
              type="password"
              name="cvv"
              placeholder="CVV"
              maxLength="3"
              value={paymentDetails.cvv}
              onChange={handleChange}
              required
            /><br /><br />
          </div>
        )}

        {selectedPaymentMethod === 'upi' && (
          <div style={{ textAlign: 'center' }}>
            <p>Scan the QR code to pay with any UPI app.</p>
            <img src="https://via.placeholder.com/200" alt="UPI QR Code" style={{ border: '1px solid #ccc', borderRadius: '8px' }} /><br /><br />
            <input
              type="text"
              name="upiId"
              placeholder="Enter UPI ID (optional)"
              value={paymentDetails.upiId}
              onChange={handleChange}
            /><br /><br />
          </div>
        )}

        {selectedPaymentMethod === 'netbanking' && (
          <div style={{ textAlign: 'center' }}>
            <p>You will be redirected to your bank's website to complete the payment.</p>
            <button type="submit" disabled={loading}>
              Proceed to Bank
            </button>
          </div>
        )}

        {selectedPaymentMethod !== 'netbanking' && (
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        )}
      </form>
    </div>
  );
};

export default PaymentPage;