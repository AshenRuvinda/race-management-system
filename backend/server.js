const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const setupSocket = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const racerRoutes = require('./routes/racerRoutes');
const raceRoutes = require('./routes/raceRoutes');
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./middleware/errorMiddleware');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Add io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/racers', racerRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});