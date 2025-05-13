

// -------------------------------------------------------------------------------

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import museumBackground from './assets/museum_background.jpg';
import axios from 'axios';
import './App.css';

function Register({ setIsLoggedIn, setUserId }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/register', { username, password });
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${museumBackground})` }}>
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </label>
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}

export default Register;