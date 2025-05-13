//App.jsx - This serves as a root componenet, managing routing, state, layout, integration.
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './Header'; //Routing
import Footer from './Footer';
import Museum_Card from './Museum_Card';
import artpic from './assets/art_museum.jpg';
import carpic from './assets/car_museum.jpg';
import waxpic from './assets/wax_museum.jpg';
import Booking from './Booking';
import MyTickets from './MyTickets';
import Register from './Register';
import Login from './Login';
import axios from 'axios'; //Makes HTTP requests to the backend.

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);//State
  const [userId, setUserId] = useState(null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    alert('Logged out successfully.');
  };

  const addTicket = async (ticket) => {
    if (!isLoggedIn) {
      alert('Please log in to book tickets.');
      return false;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/tickets', {
        ...ticket,
        userId,
      });
      return response.status === 201;
    } catch (error) {
      console.error('Error booking ticket:', error);
      alert('Failed to book ticket.');
      return false;
    }
  };

  return (
    <Router>
      <div className="app">
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Routes>
          <Route
            path="/" //Homepage
            element={
              isLoggedIn ? (
                <div className="museum-list">
                  <Museum_Card
                    img={artpic}
                    museumName="Art Museum"
                    description="This is an art Museum"
                    isLoggedIn={isLoggedIn}
                  />
                  <Museum_Card
                    img={carpic}
                    museumName="Payana"
                    description="This is an automobile museum"
                    isLoggedIn={isLoggedIn}
                  />
                  <Museum_Card
                    img={waxpic}
                    museumName="Wax Museum"
                    description="This is a wax Museum"
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/booking/:museumName"
            element={
              isLoggedIn ? (
                <Booking addTicket={addTicket} userId={userId} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/my-tickets"
            element={
              isLoggedIn ? (
                <MyTickets userId={userId} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} setUserId={setUserId} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserId={setUserId} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Footer addTicket={addTicket} isLoggedIn={isLoggedIn} userId={userId} />
      </div>
    </Router>
  );
}

export default App;