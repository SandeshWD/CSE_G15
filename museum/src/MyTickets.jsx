

// -------------------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function MyTickets({ userId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tickets/${userId}`);
        setTickets(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchTickets();
    }
  }, [userId]);

  if (!userId) {
    return <div className="my-tickets">Please log in to view your tickets.</div>;
  }

  if (loading) {
    return <div className="my-tickets">Loading tickets...</div>;
  }

  if (error) {
    return <div className="my-tickets">{error}</div>;
  }

  return (
    <div className="my-tickets">
      <h2>Your Booked Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets booked yet.</p>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card">
              <h3>{ticket.museumName}</h3>
              <div className="ticket-details">
                <p><strong>Number of Tickets:</strong> {ticket.numTickets}</p>
                <p><strong>Visit Date:</strong> {ticket.visitDate}</p>
                <p><strong>Total Amount:</strong> ₹{ticket.totalPrice}</p>
                <p>
                  <strong>Payment Status:</strong>
                  <span className={ticket.paid ? 'status-paid' : 'status-pending'}>
                    {ticket.paid ? 'Paid' : 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;