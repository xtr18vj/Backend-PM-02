const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const migrate = require('./database/migrate');
const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

async function startServer() {
  try {

    await migrate();

    const PORT = config.port;
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('🔐 Authentication Server Started');
      console.log('========================================');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📦 Database: ${config.database.path}`);
      console.log('========================================\n');
      console.log('Available endpoints:');
      console.log('  POST /api/auth/register       - Register new user');
      console.log('  GET  /api/auth/verify-email   - Verify email');
      console.log('  POST /api/auth/login          - Login');
      console.log('  POST /api/auth/refresh        - Refresh tokens');
      console.log('  POST /api/auth/logout         - Logout');
      console.log('  POST /api/auth/logout-all     - Logout all devices');
      console.log('  POST /api/auth/forgot-password - Request password reset');
      console.log('  POST /api/auth/reset-password - Reset password');
      console.log('  GET  /api/auth/me             - Get current user');
      console.log('  POST /api/auth/resend-verification - Resend email');
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
