// src/index.ts
// MUST be first: loads .env before any other module reads process.env
import 'dotenv/config';

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';
import { sendSuccess } from './utils/response';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import { errorHandler } from './middlewares/error.middleware';
import contentRoutes from './routes/content.route';
import adminRoutes from './routes/admin.route';
import chatRoutes from './routes/chat.route';
import trendsRoutes from './routes/trends.route';
import scheduleRoutes from './routes/schedule.route';
import analyticsRoutes from './routes/analytics.route';
import socialRoutes from './routes/social.route';
// Initialise BullMQ worker on startup
import './services/queue.service';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl, server-to-server
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);

// ── Swagger Docs ───────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ─────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  sendSuccess(res, 'Server đang chạy!', {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    docs: `http://localhost:${PORT}/api/docs`,
  });
});

import prisma from './utils/prisma';
app.get('/api/public/stats', async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalPosts] = await Promise.all([
      prisma.user.count(),
      prisma.content.count(),
    ]);
    sendSuccess(res, 'Success', { totalUsers, totalPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/privacy-policy', (_req: Request, res: Response) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Privacy Policy</title></head><body>
<h1>Privacy Policy</h1>
<p>Last updated: May 2025</p>
<p>AiAgentMarketing ("we", "our", or "us") operates this application. This page informs you of our policies regarding the collection, use, and disclosure of personal data.</p>
<h2>Data We Collect</h2>
<p>We collect data you provide when connecting your social media accounts, including profile information and content you create through our platform.</p>
<h2>How We Use Your Data</h2>
<p>We use your data solely to provide the marketing automation services you request, including scheduling and publishing content on your behalf.</p>
<h2>Data Deletion</h2>
<p>You may request deletion of your data at any time by contacting us or using the in-app data deletion feature.</p>
<h2>Contact</h2>
<p>Email: imanutttt@gmail.com</p>
</body></html>`);
});

app.get('/terms-of-service', (_req: Request, res: Response) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Terms of Service</title></head><body>
<h1>Terms of Service</h1>
<p>Last updated: May 2025</p>
<p>By using AiAgentMarketing, you agree to these terms. You are responsible for all content posted through your connected accounts.</p>
<h2>Use of Service</h2>
<p>This service is provided for lawful marketing purposes only. You must not use this service to post illegal, harmful, or misleading content.</p>
<h2>Account Security</h2>
<p>You are responsible for maintaining the security of your account credentials.</p>
<h2>Termination</h2>
<p>We reserve the right to terminate accounts that violate these terms.</p>
<h2>Contact</h2>
<p>Email: imanutttt@gmail.com</p>
</body></html>`);
});

// ── 404 Handler ────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('─────────────────────────────────────────');
  console.log(`✅  Server:  http://localhost:${PORT}`);
  console.log(`📄  API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`🌍  Mode:    ${process.env.NODE_ENV}`);
  console.log('─────────────────────────────────────────');
});

// Error handler 
app.use(errorHandler);

export default app;
