import React, { useState, useEffect } from 'react';
import { CallControls } from '@/components/CallControls';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { ScamMeter } from '@/components/ScamMeter';
import { RiskAlert } from '@/components/RiskAlert';
import WebRTCVoiceChat from '@/components/WebRTCVoiceChat';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

export default function Index() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerNumber] = useState("+91 9876543210"); // Simulated incoming number
  const [warningIgnored, setWarningIgnored] = useState(false);
  const [scamType, setScamType] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState<string | null>(null);
  const [recommendedAction, setRecommendedAction] = useState<string | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      <div className="max-w-md mx-auto">
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

      {showWarning && !warningIgnored && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96 max-w-full">
          <div className="bg-red-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚠️</span>
              <button
                onClick={handleIgnoreWarning}
                className="text-white hover:text-red-200 transition-colors"
              >
                Ignore
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-white">
                Risk Level: {riskScore}%
              </p>
              
              {matchedKeywords?.length > 0 && (
                <div className="text-sm text-red-100">
                  <p className="font-semibold">Suspicious Keywords:</p>
                  <p>{matchedKeywords.join(', ')}</p>
                </div>
              )}

              {scamType && (
                <div className="text-sm text-red-100">
                  <p className="font-semibold">AI Analysis:</p>
                  <p>Type: {scamType}</p>
                  {additionalDetails && (
                    <p className="mt-1">{additionalDetails}</p>
                  )}
                  {recommendedAction && (
                    <p className="mt-1 font-semibold">
                      Recommendation: {recommendedAction}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
