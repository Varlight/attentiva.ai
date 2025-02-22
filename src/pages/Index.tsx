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

const RISK_WORDS = {
  otp: 20,
  bank: 15,
  urgent: 25,
  account: 15,
  verify: 20,
  immediate: 25,
  suspicious: 20,
  password: 30,
  "credit card": 35,
  "social security": 40,
  transfer: 20,
  emergency: 25,
};

const RISK_THRESHOLD = 50;
const AUTO_DISCONNECT_THRESHOLD = 75;

const SIMULATED_SCAM_MESSAGES = [
  "Hello, this is an urgent call regarding your bank account",
  "We've detected suspicious activity and need your immediate verification",
  "Please provide your OTP to verify your identity",
  "This is an emergency regarding your credit card",
  "We need you to transfer funds to a secure account",
];

const generateMessage = (isIncoming: boolean): MessageType => {
  if (isIncoming) {
    const randomMessage = SIMULATED_SCAM_MESSAGES[Math.floor(Math.random() * SIMULATED_SCAM_MESSAGES.length)];
    return {
      id: Date.now(),
      text: randomMessage,
      type: "incoming",
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  const normalPhrases = [
    "I don't share personal information",
    "I need to verify this call first",
    "I'll call my bank directly",
    "I don't recognize this number",
    "Please remove me from your list",
  ];

  return {
    id: Date.now(),
    text: normalPhrases[Math.floor(Math.random() * normalPhrases.length)],
    type: "outgoing",
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
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  const calculateRiskScore = (text: string): number => {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    Object.entries(RISK_WORDS).forEach(([word, value]) => {
      if (lowerText.includes(word.toLowerCase())) {
        score += value;
      }
    });

    if (lowerText.includes("urgent") && lowerText.includes("bank")) {
      score += 30;
    }
    if (lowerText.includes("verify") && lowerText.includes("otp")) {
      score += 40;
    }

    return Math.min(score, 100);
  };

  useEffect(() => {
    const flaggedNumbers = JSON.parse(localStorage.getItem(FLAGGED_NUMBERS_KEY) || '[]');
    setIsFlagged(flaggedNumbers.includes(currentNumber));
  }, [currentNumber]);

  useEffect(() => {
    if (riskScore >= RISK_THRESHOLD && !showWarning) {
      setShowWarning(true);
    }
    
    if (riskScore >= AUTO_DISCONNECT_THRESHOLD) {
      handleCallEnd();
      toast.error("Call automatically terminated due to high risk score");
    }
  }, [riskScore]);

  useEffect(() => {
    let messageTimer: number;
    if (isCallActive) {
      messageTimer = window.setInterval(() => {
        const newMessage = generateMessage(true);
        setMessages(prev => [...prev, newMessage]);
        
        const newScore = calculateRiskScore(newMessage.text);
        setRiskScore(prev => Math.min(prev + newScore, 100));
      }, 5000);
    }
    return () => {
      if (messageTimer) clearInterval(messageTimer);
    };
  }, [isCallActive]);

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

  useEffect(() => {
    const incomingCallTimer = setInterval(() => {
      if (!isCallActive && !isIncomingCall) {
        setIsIncomingCall(true);
        toast("Incoming Call", {
          description: `${callerName} - ${currentNumber}`,
          duration: 10000,
        });
        if (isFlagged) {
          setTimeout(() => {
            setIsIncomingCall(false);
            toast.error("Automatically blocked flagged number");
          }, 2000);
        }
      }
    }, 30000);

    return () => clearInterval(incomingCallTimer);
  }, [isCallActive, isIncomingCall, isFlagged, callerName, currentNumber]);

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
      handleCallEnd();
    }
  };

  const handleCallStart = () => {
    if (isFlagged) {
      toast.error("Cannot start call with flagged number");
      return;
    }
    setIsCallActive(true);
    setMessages([]);
    setRiskScore(0);
    setShowWarning(false);
    setCallDuration(0);
    setIsIncomingCall(false);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setRiskScore(0);
    setShowWarning(false);
    setCallDuration(0);
    setIsIncomingCall(false);
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
