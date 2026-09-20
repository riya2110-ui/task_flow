require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TaskFlow Server] listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
