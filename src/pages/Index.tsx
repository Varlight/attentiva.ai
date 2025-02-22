import React, { useState, useEffect } from 'react';
import { CallControls } from '@/components/CallControls';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { ScamMeter } from '@/components/ScamMeter';
import { RiskAlert } from '@/components/RiskAlert';
import WebRTCVoiceChat from '@/components/WebRTCVoiceChat';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import OpenAI from 'openai';
export default function Index() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningIgnored, setWarningIgnored] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerNumber] = useState("+91 9876543210"); // Simulated incoming number

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Callback when WebRTCVoiceChat updates transcript
  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
    // Simple risk score calculation based on keywords:
    const riskWords: { [key: string]: number } = {
      "otp": 20,
      "bank": 15,
      "urgent": 25,
      "account": 15,
      "verify": 20,
      "transfer": 20,
      "lottery": 25,
      "winner": 25,
      "prize": 20,
      "inheritance": 20,
      "sweepstakes": 25,
      "emergency": 25,
      "insurance": 15,
      "tax": 15,
      "refund": 15,
      "credit": 20,
      "debit": 20,
      "ssn": 30,
      "social security": 30,
      "security code": 20,
      "pin": 20,
      "password": 20,
      "confidential": 15,
      "verification": 20,
      "immediate": 25,
      "action required": 25,
      "account suspended": 30,
      "alert": 20,
      "fraud": 30,
      "scam": 30,
      "phishing": 30,
      "investment": 15,
      "guaranteed": 20,
      "profit": 20,
      "claim": 15,
      "limited time": 25,
      "offer": 15,
      "bonus": 15,
      "free": 10,
      "deal": 10,
      "exclusive": 15,
      "risk": 20,
      "danger": 20,
      "warning": 20,
      "immediate action": 25,
      "pay now": 25,
      "wire": 20,
      "money": 20,
      "funds": 20,
      "invest": 15,
      "crypto": 20,
      "bitcoin": 20,
      "ethereum": 20,
      "blockchain": 15,
      "nigeria": 25,
      "inheritance scam": 30
    };
    let score = 0;
    const lowerText = text.toLowerCase();
    for (const word in riskWords) {
      if (lowerText.includes(word)) {
        score += riskWords[word];
      }
    }
    const calculatedScore = Math.min(score, 100);
    setRiskScore(calculatedScore);
    if (calculatedScore >= 50) {
      setShowWarning(true);
    }
  };

  const handleCallStart = () => {
    setIsCallActive(true);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setTranscript("");
    setRiskScore(0);
    setShowWarning(false);
  };

  const handleFlag = () => {
    setIsFlagged(true);
    // Optionally: persist flagged number and end call
  };

  const handleIgnoreWarning = () => {
    setWarningIgnored(true);
    setShowWarning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {showWarning && !warningIgnored && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96 max-w-full">
          <div className="bg-red-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                <p className="font-semibold text-white">
                  Risk Level: {riskScore}%
                </p>
              </div>
              <button
                onClick={handleIgnoreWarning}
                className="text-white hover:text-red-200 transition-colors"
              >
                Ignore
              </button>
            </div>
            <p className="mt-2 text-sm text-red-100">
              This call shows signs of being a potential scam.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Card className={cn(
          "backdrop-blur-lg bg-white/10 shadow-2xl",
          "border border-white/20 rounded-3xl transition-all duration-300",
          isFlagged && "border-red-500/50 shadow-red-500/20"
        )}>
          <CardContent className="p-6">
            {/* Call Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="text-white/80 text-sm">Incoming Call</div>
              <div className="text-2xl font-bold text-white">{callerNumber}</div>
              {isCallActive && (
                <div className="text-emerald-400 font-mono">
                  {formatDuration(callDuration)}
                </div>
              )}
              <div className={cn(
                "text-sm font-medium",
                isCallActive ? "text-emerald-400" : "text-white/60"
              )}>
                {isCallActive ? "Call in progress" : "Ready to receive calls"}
              </div>
            </div>

            {/* Call Interface */}
            <div className="space-y-6">
              <div className="bg-black/20 rounded-2xl p-4">
                <WebRTCVoiceChat 
                  onTranscript={handleTranscriptUpdate}
                  onCallStart={handleCallStart}
                  onCallEnd={handleCallEnd}
                  isCallActive={isCallActive}
                />
              </div>

              {isCallActive && (
                <>
                  <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-white/80 text-sm mb-2">Live Transcript</div>
                    <TranscriptDisplay transcript={transcript} />
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-white/80 text-sm mb-2">Risk Assessment</div>
                    <ScamMeter score={riskScore} />
                  </div>
                </>
              )}

              <div className="pt-4">
                <CallControls
                  isCallActive={isCallActive}
                  onCallStart={handleCallStart}
                  onCallEnd={handleCallEnd}
                  onFlag={handleFlag}
                  isFlagged={isFlagged}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-white/60 text-sm">
          Protected by AI-Powered Scam Detection
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
