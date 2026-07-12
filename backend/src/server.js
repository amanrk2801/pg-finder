const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/env');

async function start() {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server listening on port ${PORT} (Accessible on local network)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
