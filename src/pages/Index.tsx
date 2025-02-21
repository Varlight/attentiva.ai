
import { useState, useEffect } from "react";
import { CallControls } from "@/components/CallControls";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { ScamMeter } from "@/components/ScamMeter";
import { RiskAlert } from "@/components/RiskAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Signal, Battery, Wifi } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type MessageType = {
  id: number;
  text: string;
  type: "incoming" | "outgoing";
  timestamp: string;
};

// Simulated transcript messages for demo
const generateMessage = (isIncoming: boolean): MessageType => {
  const scamPhrases = [
    "We detected suspicious activity",
    "Your account needs immediate attention",
    "Verify your identity now",
    "Time-sensitive matter regarding your account",
    "You must act now to prevent",
  ];
  
  const normalPhrases = [
    "How can I help you today?",
    "Could you please explain more?",
    "I understand your concern",
    "Let me check that for you",
    "Is there anything else you need?",
  ];

  return {
    id: Date.now(),
    text: isIncoming ? 
      scamPhrases[Math.floor(Math.random() * scamPhrases.length)] :
      normalPhrases[Math.floor(Math.random() * normalPhrases.length)],
    type: isIncoming ? "incoming" : "outgoing",
    timestamp: new Date().toLocaleTimeString(),
  };
};

const FLAGGED_NUMBERS_KEY = 'flaggedNumbers';

export default function Index() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [currentNumber] = useState("1234567890");
  const [isFlagged, setIsFlagged] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName] = useState("Unknown Caller");

  useEffect(() => {
    // Check if number is flagged
    const flaggedNumbers = JSON.parse(localStorage.getItem(FLAGGED_NUMBERS_KEY) || '[]');
    setIsFlagged(flaggedNumbers.includes(currentNumber));
  }, [currentNumber]);

  useEffect(() => {
    if (riskScore >= 50 && !showWarning) {
      setShowWarning(true);
    }
  }, [riskScore]);

  // Call duration timer
  useEffect(() => {
    let timer: number;
    if (isCallActive) {
      timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFlagNumber = () => {
    const flaggedNumbers = JSON.parse(localStorage.getItem(FLAGGED_NUMBERS_KEY) || '[]');
    if (!flaggedNumbers.includes(currentNumber)) {
      flaggedNumbers.push(currentNumber);
      localStorage.setItem(FLAGGED_NUMBERS_KEY, JSON.stringify(flaggedNumbers));
      setIsFlagged(true);
      toast.success("Number has been flagged");
    }
  };

  const handleCallStart = () => {
    setIsCallActive(true);
    setMessages([]);
    setRiskScore(0);
    setShowWarning(false);
    setCallDuration(0);
    if (isFlagged) {
      toast.warning("This number was previously flagged as suspicious");
    }
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setRiskScore(0);
    setShowWarning(false);
    setCallDuration(0);
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-0 md:p-6">
      <div className="mobile-container">
        <div className="mobile-status-bar">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
          </div>
        </div>
        
        <header className="mobile-header">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h1 className="text-lg font-medium">Call Guard</h1>
          </div>
          {isFlagged && (
            <span className="text-xs px-2 py-1 bg-red-500 rounded-full">Flagged</span>
          )}
        </header>

        <div className="p-4 space-y-4">
          <Card className={cn("glass-panel", isFlagged && "border-red-500/50")}>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                {isCallActive && (
                  <div className="text-sm text-neutral-500 animate-pulse">
                    {formatDuration(callDuration)}
                  </div>
                )}
                <h2 className="text-2xl font-medium mb-1">{callerName}</h2>
                <p className="text-sm text-neutral-500">
                  {currentNumber}
                  {isFlagged && (
                    <span className="ml-2 text-red-500">(Suspicious)</span>
                  )}
                </p>
              </div>

              <div className="mt-8">
                <CallControls
                  isCallActive={isCallActive}
                  onCallStart={handleCallStart}
                  onCallEnd={handleCallEnd}
                  onFlag={handleFlagNumber}
                  isFlagged={isFlagged}
                />
              </div>
            </CardContent>
          </Card>

          {isCallActive && (
            <Card className="glass-panel">
              <CardContent className="p-4 space-y-4">
                <ScamMeter score={riskScore} />
                <TranscriptDisplay messages={messages} />
              </CardContent>
            </Card>
          )}

          <RiskAlert 
            isOpen={showWarning} 
            score={riskScore} 
            onIgnore={() => setShowWarning(false)} 
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
