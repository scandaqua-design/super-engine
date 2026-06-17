import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Procurement OS',
    version: '1.0.0-mvp'
  });
});

export default router;
