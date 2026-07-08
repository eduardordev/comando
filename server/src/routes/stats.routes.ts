import { Router } from 'express';
import { getStats } from '../services/stats.service';

export const statsRouter = Router();

statsRouter.get('/', async (_req, res) => {
  const stats = await getStats();
  res.json(stats);
});
