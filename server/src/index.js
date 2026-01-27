require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./lib/mongodb');

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
async function start() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
