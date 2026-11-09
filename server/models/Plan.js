import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  financial: {
    loan: Number,
    emi: Number,
    income: Number,
    expenses: Number,
    savings: Number,
    stressScore: Number,
    lastUpdated: { type: Date, default: Date.now }
  },
  career: {
    marks: Number,
    skill: Number,
    comm: Number,
    intern: Number,
    careerScore: Number,
    lastUpdated: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Plan', planSchema);
