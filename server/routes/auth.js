import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Email/name/role required' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, role });
      await user.save();
    }

    const payload = { userId: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'lifelift_secret', { expiresIn: '12h' });
    return res.json({ token, user: payload });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const validateToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'lifelift_secret');
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export { router as authRouter, validateToken };
