import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'scam-numbers.json');

async function getScamNumbers() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create empty database
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify({ numbers: [] }));
    return { numbers: [] };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { phoneNumber, action } = req.body;

    const db = await getScamNumbers();

    if (action === 'verify') {
      const isScamNumber = db.numbers.includes(phoneNumber);
      return res.status(200).json({ isScamNumber });
    }

    if (action === 'add') {
      if (!db.numbers.includes(phoneNumber)) {
        db.numbers.push(phoneNumber);
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
      }
      return res.status(200).json({ success: true });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
} 