import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

interface ScamData {
  phoneNumber: string;
  timestamp: number;
  scamType: string;
  confidence: number;
  transcript: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scamData: ScamData = req.body;
    const dataFilePath = path.join(process.cwd(), 'data', 'scam-records.json');
    
    // Read existing data
    let existingData: ScamData[] = [];
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist yet, will create new
    }

    // Add new record
    existingData.push(scamData);

    // Ensure directory exists
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    
    // Write updated data
    await fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing scam data:', error);
    res.status(500).json({ error: 'Failed to store scam data' });
  }
} 