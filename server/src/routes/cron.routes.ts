import { Router } from 'express';
import { getDigestData } from '../services/task.service';
import { sendDailyDigest } from '../services/email.service';

export const cronRouter = Router();

cronRouter.get('/daily-digest', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const data = await getDigestData();
  const result = await sendDailyDigest(data);

  if (!result.sent) {
    res.status(500).json({ ok: false, reason: result.reason });
    return;
  }
  res.json({ ok: true });
});
