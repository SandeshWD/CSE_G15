
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import museumBackground from './assets/museum_background.jpg';
import axios from 'axios';
import './App.css';

function Login({ setIsLoggedIn, setUserId }) {
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
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setIsLoggedIn(true);
      setUserId(response.data.userId);
      alert(response.data.message);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      alert(error.response?.data?.message || 'Login failed. Please check your username or password.');
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${museumBackground})` }}>
      <div className="auth-form">
        <h2>Login</h2>
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
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;