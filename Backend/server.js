
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://wdsandesh:ECXpLfuhV41meVgW@cluster0.rujyt6s.mongodb.net/museumTicketing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Ticket Schema and Model
const ticketSchema = new mongoose.Schema({
  museumName: String,
  numTickets: Number,
  visitDate: String,
  totalPrice: Number,
  userId: String,
  paid: Boolean,
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// Card Schema and Model
const cardSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true, unique: true, match: /^\d{16}$/ },
  expiryDate: { type: String, required: true, match: /^(0[1-9]|1[0-2])\/\d{2}$/ },
  cvv: { type: String, required: true, match: /^\d{3}$/ },
});
const Card = mongoose.model('Card', cardSchema);

// Initialize cards collection (force clear and re-insert for debugging)
const initializeCards = async () => {
  await Card.deleteMany({}); // Clear existing cards
  const initialCards = [
    { cardNumber: '1234567890123456', expiryDate: '12/25', cvv: '123' },
    { cardNumber: '2345678901234567', expiryDate: '11/26', cvv: '234' },
    { cardNumber: '3456789012345678', expiryDate: '10/27', cvv: '345' },
    { cardNumber: '4567890123456789', expiryDate: '09/28', cvv: '456' },
    { cardNumber: '5678901234567890', expiryDate: '08/29', cvv: '567' },
  ];
  await Card.insertMany(initialCards);
  console.log('Initialized 5 card numbers with expiry dates and CVVs in database');
};

// Call initializeCards on server start
initializeCards().catch((err) => console.error('Error initializing cards:', err));

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Register Route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ userId: user._id, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ userId: user._id, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { museumName, numTickets, visitDate, totalPrice, userId, paid } = req.body;
    const ticket = new Ticket({
      museumName,
      numTickets,
      visitDate,
      totalPrice,
      userId,
      paid,
    });
    await ticket.save();
    res.status(201).json({ message: 'Ticket booked successfully' });
  } catch (error) {
    console.error('Error booking ticket:', error);
    res.status(500).json({ error: 'Failed to book ticket' });
  }
});

// Get Tickets by User ID
app.get('/api/tickets/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Validate Card Number, Expiry Date, and CVV
app.post('/api/validate-card', async (req, res) => {
  try {
    let { cardNumber, expiryDate, cvv } = req.body;
    // Normalize inputs
    cardNumber = cardNumber ? cardNumber.trim() : '';
    expiryDate = expiryDate ? expiryDate.trim() : '';
    cvv = cvv ? cvv.trim() : '';
    console.log('Received card validation request:', { cardNumber, expiryDate, cvv });
    if (!cardNumber || !expiryDate || !cvv) {
      console.log('Missing required fields');
      return res.status(400).json({ valid: false, message: 'Card number, expiry date, and CVV are required' });
    }
    const card = await Card.findOne({ cardNumber, expiryDate, cvv });
    console.log('Database query result:', card);
    if (card) {
      console.log('Card validated successfully');
      res.json({ valid: true, message: 'Card is valid' });
    } else {
      console.log('No matching card found');
      res.json({ valid: false, message: 'Invalid card details' });
    }
  } catch (error) {
    console.error('Error validating card:', error);
    res.status(500).json({ valid: false, message: 'Failed to validate card' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));