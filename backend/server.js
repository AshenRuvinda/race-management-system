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

app.use(cors());
app.use(express.json());

connectDB();

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/racers', racerRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/events', eventRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));