
// ==========================================================================================

import { useState } from 'react';
import OpenAI from 'openai';
import axios from 'axios';
import './App.css';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function Footer({ addTicket, isLoggedIn, userId }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [bookingState, setBookingState] = useState(null); 
  const [bookingData, setBookingData] = useState({});

  const toggleChatbot = () => setIsChatOpen(!isChatOpen);

  const handleBookTickets = () => {
    setBookingState('museum');
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Please specify the museum (Art Museum, Payana, or Wax Museum).' },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (bookingState) {
      if (bookingState === 'museum') {
        const museum = input.trim().toLowerCase();
        const validMuseums = ['art museum', 'payana', 'wax museum'];
        if (validMuseums.includes(museum)) {
          setBookingData((prev) => ({ ...prev, museumName: input.trim() }));
          setBookingState('tickets');
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'How many tickets would you like to book?' },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Invalid museum. Please choose Art Museum, Payana, or Wax Museum.' },
          ]);
        }
      } else if (bookingState === 'tickets') {
        const numTickets = parseInt(input.trim(), 10);
        if (numTickets > 0 && numTickets <= 10) {
          setBookingData((prev) => ({ ...prev, numTickets }));
          setBookingState('date');
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Please specify the visit date (e.g., 2025-05-01).' },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Please enter a valid number of tickets (1-10).' },
          ]);
        }
      } else if (bookingState === 'date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(input.trim())) {
          const visitDate = input.trim();
          const date = new Date(visitDate);
          const today = new Date();
          if (date >= today) {
            setBookingData((prev) => ({ ...prev, visitDate }));
            setBookingState('payment');
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: 'Please enter your card details in the payment form below.' },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: 'Please enter a future date (e.g., 2025-05-01).' },
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-05-01).' },
          ]);
        }
      }
    } else {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant for a museum ticketing system. Answer questions about museums, tickets, or general inquiries.' },
            ...messages,
            userMessage,
          ],
        });
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.choices[0].message.content },
        ]);
      } catch (error) {
        console.error('Error with OpenAI API:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, something went wrong. Try again later.' },
        ]);
      }
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const cardNumber = e.target.cardNumber.value.replace(/\D/g, '').trim();
    const expiry = e.target.expiry.value.trim();
    const cvv = e.target.cvv.value.replace(/\D/g, '').trim();

    // Validate card details
    if (!/^\d{16}$/.test(cardNumber)) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Invalid card number. Must be 16 digits.' },
      ]);
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Invalid expiry date. Use MM/YY format.' },
      ]);
      return;
    }
    if (!/^\d{3}$/.test(cvv)) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Invalid CVV. Must be 3 digits.' },
      ]);
      return;
    }

    // Log request data
    const requestData = { cardNumber, expiryDate: expiry, cvv };
    console.log('Sending card validation request:', requestData);

    // Validate card details against database
    try {
      const response = await axios.post('http://localhost:5000/api/validate-card', requestData);
      console.log('Card validation response:', response.data);
      if (!response.data.valid) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.data.message || 'Invalid card details. Please verify your card number, expiry date, and CVV.' },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.message || 'Card validated successfully.' },
      ]);
    } catch (error) {
      console.error('Error validating card:', error.response ? error.response.data : error.message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error.response?.data?.message || 'Failed to validate card. Please try again later.' },
      ]);
      return;
    }

    const ticket = {
      museumName: bookingData.museumName,
      numTickets: bookingData.numTickets,
      visitDate: bookingData.visitDate,
      totalPrice: bookingData.numTickets * 500,
      userId,
      paid: true,
    };

    const success = await addTicket(ticket);
    if (success) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Payment successful! Ticket booked successfully for ${ticket.museumName}! View in My Tickets.` },
      ]);
      setBookingState(null);
      setBookingData({});
      e.target.reset();
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to book ticket.' },
      ]);
    }
  };

  return (
    <>
      <footer className="footer">
        <p>© 2025 Museum Ticketing System</p>
      </footer>
      {isLoggedIn && (
        <div className="chatbot-container">
          <button className="chatbot-toggle" onClick={toggleChatbot}>
            {isChatOpen ? 'Close Chat' : 'Chat with Us'}
          </button>
          {isChatOpen && (
            <div className="chatbot-window">
              <div className="chatbot-header">
                <button className="chatbot-book-button" onClick={handleBookTickets}>
                  Book Tickets
                </button>
              </div>
              <div className="chatbot-messages">
                {messages.length === 0 && (
                  <p className="chatbot-welcome">Welcome! Ask me about museums or tickets, or click "Book Tickets" to start booking.</p>
                )}
                {messages.map((msg, index) => (
                  <div key={index} className={`chatbot-message ${msg.role}`}>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
              {bookingState === 'payment' && (
                <form className="chatbot-payment-form" onSubmit={handlePaymentSubmit}>
                  <input type="text" name="cardNumber" placeholder="Card Number (16 digits)" required />
                  <input type="text" name="expiry" placeholder="Expiry (MM/YY)" required />
                  <input type="text" name="cvv" placeholder="CVV (3 digits)" required />
                  <button type="submit">Pay ₹{bookingData.numTickets * 500}</button>
                </form>
              )}
              <div className="chatbot-input">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  disabled={bookingState === 'payment'}
                />
                <button onClick={handleSend} disabled={bookingState === 'payment'}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Footer;