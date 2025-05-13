

// ---------------------------------------------------------------------------------------


import { useNavigate } from 'react-router-dom';
import './Museum_Card.css';

function Card({ img, museumName, description, isLoggedIn }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${encodeURIComponent(museumName)}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      <img className="cardImg" src={img} alt={museumName} />
      <h2>{museumName}</h2>
      <p>{description}</p>
    </div>
  );
}

export default Card;