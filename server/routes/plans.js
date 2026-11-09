import express from 'express';
import Plan from '../models/Plan.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(5);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
