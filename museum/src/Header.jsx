
import { Link } from 'react-router-dom';

function Header({ isLoggedIn, handleLogout }) {
  return (
    <header className="header">
      <h1>Museum Ticket Booking</h1>
      <nav>
        {isLoggedIn ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/my-tickets">My Tickets</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;