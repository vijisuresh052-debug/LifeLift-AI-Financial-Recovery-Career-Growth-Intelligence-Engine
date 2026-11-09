import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { validateToken } from './auth.js';

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const router = express.Router();

router.post('/', validateToken, async (req, res) => {
  const { financial, career, context } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not set in server environment.' });
  }

  try {
    const prompt = `You are LifeLift AI coach persona (Friendly Mentor).\nContext: ${context}\nFinancial Input: ${JSON.stringify(financial)}\nCareer Input: ${JSON.stringify(career)}\nProvide:
1) Emotional motivation line
2) 3 practical steps for debt repayment
3) 3 practical steps for career growth
4) Simulator comparison of timeline, and suggested quick wins.`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a friendly, clear-steps AI financial and career mentor.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 480,
      temperature: 0.7
    });

    const text = completion.data.choices?.[0]?.message?.content || 'No response from OpenAI';
    res.json({ advice: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'OpenAI request failed.' });
  }
});

export default router;
