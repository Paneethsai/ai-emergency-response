import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/authRoutes';
import incidentRoutes from './routes/incidentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ai-emergency-response.vercel.app',
  // Allow any vercel.app subdomain for preview deployments
  /^https:\/\/ai-emergency-response.*\.vercel\.app$/,
  // Allow custom domain if set
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
