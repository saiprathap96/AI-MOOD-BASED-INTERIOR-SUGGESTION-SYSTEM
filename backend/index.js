require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('./utils/db');
const suggestionRoutes = require('./routes/suggestionRoutes');

const app = express();
app.get("/", (req, res) => {
  res.send("Sri Venkata Sai Furniture Works backend is running.");
});
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

// Apply security headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows files or APIs to be accessed across origins
}));

// Logging middleware
app.use(morgan('dev'));

// Parsing middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/suggestions', suggestionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize DB and start server
const startServer = async () => {
  try {
    // Seeding/DB init
    await db.init();
    
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Sri Venkata Sai Furniture Works backend is running.   `);
      console.log(` Port: http://localhost:${PORT}                        `);
      console.log(` Health Check: http://localhost:${PORT}/api/health      `);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
