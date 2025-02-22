import { useEffect, useState } from 'react';

interface ScamRecord {
  phoneNumber: string;
  timestamp: number;
  scamType: string;
  confidence: number;
  transcript: string;
}

export function ScamHistory() {
  const [records, setRecords] = useState<ScamRecord[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('/api/get-scam-records');
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching scam records:', error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-4">Scam Call History</h2>
      <div className="space-y-4">
        {records.map((record, index) => (
          <div key={index} className="bg-red-50 p-4 rounded-lg">
            <div className="font-bold">{record.phoneNumber}</div>
            <div className="text-sm text-gray-600">
              {new Date(record.timestamp).toLocaleString()}
            </div>
            <div className="text-red-600">{record.scamType}</div>
            <div className="text-sm">Confidence: {record.confidence}%</div>
            <div className="text-sm mt-2">{record.transcript}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 