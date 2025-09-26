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

// Import models for debug routes
const Race = require('./models/Race');
const Racer = require('./models/Racer');
const Team = require('./models/Team');
const User = require('./models/User');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
    console.log(`IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`User-Agent: ${req.get('User-Agent')}`);
    
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    // Log response when it's sent
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`Response Status: ${res.statusCode}`);
      if (res.statusCode >= 400) {
        console.log('Error Response:', data);
      }
      originalSend.call(this, data);
    };
    
    next();
  });
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB with enhanced logging
const initializeDatabase = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Test database collections
    try {
      const collections = await Promise.all([
        User.countDocuments(),
        Team.countDocuments(),
        Racer.countDocuments(),
        Race.countDocuments()
      ]);
      
      console.log('📊 Database Collections Status:');
      console.log(`  - Users: ${collections[0]}`);
      console.log(`  - Teams: ${collections[1]}`);
      console.log(`  - Racers: ${collections[2]}`);
      console.log(`  - Races: ${collections[3]}`);
    } catch (err) {
      console.warn('⚠️  Could not fetch collection counts:', err.message);
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Initialize database connection
initializeDatabase();

// Add io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Debug routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  // Database status endpoint
  app.get('/api/debug/db-status', async (req, res) => {
    try {
      const collections = await Promise.all([
        User.countDocuments(),
        Team.countDocuments(),
        Racer.countDocuments(),
        Race.countDocuments()
      ]);
      
      res.json({
        status: 'connected',
        collections: {
          users: collections[0],
          teams: collections[1],
          racers: collections[2],
          races: collections[3]
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        status: 'error', 
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Test race creation with sample data
  app.post('/api/debug/test-race', async (req, res) => {
    try {
      console.log('🧪 Testing race creation with sample data...');
      
      // Get available racers
      const racers = await Racer.find().populate('team').limit(4);
      
      if (racers.length < 2) {
        return res.status(400).json({ 
          error: 'Need at least 2 racers in database to create a test race',
          racerCount: racers.length 
        });
      }

      console.log('Available racers for test:', racers.map(r => ({ id: r._id, name: r.name, team: r.team?.name })));

      const testRaceData = {
        venue: 'Debug Test Circuit',
        totalLaps: 5,
        startingGrid: racers.slice(0, Math.min(racers.length, 4)).map(r => r._id),
        defaultTyreType: 'medium'
      };

      console.log('Test race data:', testRaceData);

      // Import the controller function
      const { createRace } = require('./controllers/raceController');
      
      // Mock the request object
      req.body = testRaceData;
      
      // Call the controller function
      await createRace(req, res);
      
    } catch (err) {
      console.error('Test race creation failed:', err);
      res.status(500).json({ 
        error: err.message,
        stack: err.stack 
      });
    }
  });

  // Get sample racers for frontend testing
  app.get('/api/debug/sample-racers', async (req, res) => {
    try {
      const racers = await Racer.find()
        .populate('team', 'name country')
        .limit(10)
        .sort({ createdAt: -1 });
      
      res.json(racers.map(r => ({
        _id: r._id,
        name: r.name,
        racingNumber: r.racingNumber,
        team: r.team,
        country: r.country
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset test data
  app.post('/api/debug/reset-races', async (req, res) => {
    try {
      const deletedRaces = await Race.deleteMany({ venue: { $regex: /test|debug/i } });
      res.json({ 
        message: 'Test races deleted',
        count: deletedRaces.deletedCount 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/racers', racerRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Racing Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      teams: '/api/teams',
      racers: '/api/racers',
      races: '/api/races',
      events: '/api/events'
    },
    ...(process.env.NODE_ENV !== 'production' && {
      debug: {
        dbStatus: '/api/debug/db-status',
        testRace: '/api/debug/test-race',
        sampleRacers: '/api/debug/sample-racers',
        resetRaces: '/api/debug/reset-races'
      }
    })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n🚀 Server starting up...');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
  console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`📋 CORS Origins: ${allowedOrigins.join(', ')}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n🔧 Debug endpoints available:');
    console.log(`   GET  http://localhost:${PORT}/api/debug/db-status`);
    console.log(`   POST http://localhost:${PORT}/api/debug/test-race`);
    console.log(`   GET  http://localhost:${PORT}/api/debug/sample-racers`);
    console.log(`   POST http://localhost:${PORT}/api/debug/reset-races`);
  }
  
  console.log(`\n🌐 Server ready at http://localhost:${PORT}`);
  console.log('='.repeat(50));
});