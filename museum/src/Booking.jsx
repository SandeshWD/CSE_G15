
// ===========================================================================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Booking({ addTicket, userId }) {
  const { museumName } = useParams();
  const [numTickets, setNumTickets] = useState(1);
  const [visitDate, setVisitDate] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const navigate = useNavigate();

  const ticketPrice = 500; // Price per ticket in INR
  const totalPrice = numTickets * ticketPrice;

  const handleBookNow = () => {
    if (!numTickets || numTickets < 1) {
      alert('Please select a valid number of tickets.');
      return;
    }
    if (!visitDate) {
      alert('Please select a visit date.');
      return;
    }
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Validate card details
    if (!cardNumber || cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      alert('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cvv || cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV.');
      return;
    }

    // Prepare request data
    const requestData = {
      cardNumber: cardNumber.trim(),
      expiryDate: expiry.trim(),
      cvv: cvv.trim(),
    };
    console.log('Sending card validation request:', requestData);

    // Validate card details against database
    try {
      const response = await axios.post('http://localhost:5000/api/validate-card', requestData);
      console.log('Card validation response:', response.data);
      if (!response.data.valid) {
        alert(response.data.message || 'Invalid card details. Please verify your card number, expiry date, and CVV.');
        return;
      }
      alert(response.data.message || 'Card validated successfully.');
    } catch (error) {
      console.error('Error validating card:', error.response ? error.response.data : error.message);
      alert(error.response?.data?.message || 'Failed to validate card. Please try again later.');
      return;
    }

    const ticket = {
      museumName: decodeURIComponent(museumName),
      numTickets,
      visitDate,
      totalPrice,
      userId,
      paid: true,
    };

    const success = await addTicket(ticket);
    if (success) {
      alert('Payment successful! Ticket booked successfully!');
      navigate('/my-tickets');
    } else {
      alert('Failed to book ticket.');
    }
  };

  return (
    <div className="booking-page">
      <h2>Book Tickets for {decodeURIComponent(museumName)}</h2>
      {!showPaymentForm ? (
        <div className="booking-form">
          <label>
            Number of Tickets:
            <input
              type="number"
              value={numTickets}
              onChange={(e) => setNumTickets(Number(e.target.value))}
              min="1"
              required
            />
          </label>
          <label>
            Visit Date:
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              required
            />
          </label>
          <div className="ticket-details">
            <h3>Ticket Details</h3>
            <p><strong>Museum:</strong> {decodeURIComponent(museumName)}</p>
            <p><strong>Number of Tickets:</strong> {numTickets}</p>
            <p><strong>Visit Date:</strong> {visitDate || 'Not selected'}</p>
            <p><strong>Total Amount:</strong> ₹{totalPrice}</p>
          </div>
          <button onClick={handleBookNow}>Book Now</button>
        </div>
      ) : (
        <form onSubmit={handlePaymentSubmit} className="payment-form">
          <h3>Enter Bank Card Details</h3>
          <label>
            Card Number:
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="1234 5678 9012 3456"
              maxLength="16"
              required
            />
          </label>
          <label>
            Expiry Date (MM/YY):
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value.trim())}
              placeholder="MM/YY"
              required
            />
          </label>
          <label>
            CVV:
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').trim())}
              placeholder="123"
              maxLength="3"
              required
            />
          </label>
          <button type="submit">Pay and Book</button>
          <button type="button" onClick={() => setShowPaymentForm(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default Booking;