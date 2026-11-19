
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.js';
import memberRoutes from './src/routes/member.js';

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error('DATABASE_URL and JWT_SECRET must be set in backend/.env');
}

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.status(200).send('SVCE Team Member Backend is Running!');
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SVCE Team Member API'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: 'API route not found'
  });
});

app.use((err, _req, res, _next) => {
  console.error('Backend Error:', err);
  res.status(500).json({
    message: 'Internal server error'
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`SVCE Team Member API running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
