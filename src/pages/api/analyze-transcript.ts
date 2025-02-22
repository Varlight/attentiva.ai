import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { words } = req.body; // Expecting 2 words

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze these words and categorize if they indicate a scam type. 
                   you will be provided with a continous reply when you get enough words for a sentecne give a Respond with only one of these labels:
                   TECH_SUPPORT_SCAM
                   BANKING_SCAM
                   GOVERNMENT_SCAM
                   LOTTERY_SCAM
                   INVESTMENT_SCAM
                   GIFT_CARD_SCAM
                   NO_SCAM`
        },
        {
          role: "user",
          content: words
        }
      ],
      temperature: 0.1,
      max_tokens: 20
    });

    const scamType = completion.choices[0].message.content.trim();
    return res.status(200).json({ scamType });
  } catch (error) {
    console.error('Error analyzing words:', error);
    return res.status(500).json({ error: 'Failed to analyze' });
  }
} 