import cors from 'cors';
import express from 'express';
import { cronRouter } from './routes/cron.routes';
import { statsRouter } from './routes/stats.routes';
import { tasksRouter } from './routes/tasks.routes';

export function createApp() {
  const app = express();

  if (process.env.VERCEL !== '1') {
    app.use(cors());
  }
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/tasks', tasksRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/cron', cronRouter);

  return app;
}
