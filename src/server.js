require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedSlots = require('./utils/seedSlots');
const slotRoutes = require('./routes/slotRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();

// Database Connection & Slot Seeding
const startDB = async () => {
  await connectDB();
  await seedSlots();
};
startDB();

// CORS Configuration
const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['*'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile, server health checks)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    const isAllowed =
      rawOrigins.includes('*') ||
      rawOrigins.some((allowed) => {
        const withProtocol = allowed.startsWith('http') ? allowed : `https://${allowed}`;
        return withProtocol === normalizedOrigin;
      });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Aerocon Star Gazing Backend is running smoothly',
    timestamp: new Date(),
  });
});

// Root Info
app.get('/', (req, res) => {
  res.json({
    name: 'Aerocon Star Gazing Backend API',
    endpoints: {
      health: 'GET /api/health',
      slots: 'GET /api/slots',
      register: 'POST /api/register',
      verifyPass: 'GET /api/verify-pass/:passCode OR POST /api/verify-pass',
      registrations: 'GET /api/registrations',
    },
  });
});

// Mount Routes
app.use('/api/slots', slotRoutes);
app.use('/api', registrationRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A registration with this ${field} already exists.`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

