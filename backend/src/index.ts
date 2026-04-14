// src/index.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';
import { sendSuccess } from './utils/response';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import { errorHandler } from './middlewares/error.middleware';
import contentRoutes from './routes/content.route';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);

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

// TODO: Thêm routes ở đây sau

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
