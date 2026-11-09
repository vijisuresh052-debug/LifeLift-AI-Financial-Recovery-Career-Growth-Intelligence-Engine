import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import recommendationsRouter from './routes/recommendations.js';
import usersRouter from './routes/users.js';
import plansRouter from './routes/plans.js';
import { authRouter } from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/plans', plansRouter);

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifelift';

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => console.log(`LifeLift API listening on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  });
