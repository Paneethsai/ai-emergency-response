import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initFirebaseAdmin } from './config/firebaseAdmin';
import { initSocket } from './utils/socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize connections
initSocket(server);
initFirebaseAdmin();

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
