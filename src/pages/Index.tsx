import { useState, useEffect } from "react";
import { CallControls } from "@/components/CallControls";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { ScamMeter } from "@/components/ScamMeter";
import { RiskAlert } from "@/components/RiskAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Signal, Battery, Wifi, Phone, PhoneOff } from "lucide-react";
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

const NATURAL_CONVERSATION = [
  { text: "Hello, this is Steve from your bank's security department.", type: "incoming" },
  { text: "Hi, how can I help you?", type: "outgoing" },
  { text: "We've noticed some suspicious activity in your account.", type: "incoming" },
  { text: "I don't discuss account details over the phone.", type: "outgoing" },
  { text: "This is urgent, we need your OTP to verify your identity.", type: "incoming" },
  { text: "I'll contact my bank directly through their official number.", type: "outgoing" },
  { text: "Please, this is an emergency regarding your credit card.", type: "incoming" },
  { text: "I'm going to end this call now.", type: "outgoing" },
];

const FLAGGED_NUMBERS_KEY = 'flaggedNumbers';

export default function Index() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [currentNumber] = useState("1234567890");
  const [isFlagged, setIsFlagged] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName] = useState("Unknown Caller");
  const [messageIndex, setMessageIndex] = useState(0);

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
        const newMessage = generateMessage(messageIndex);
        setMessages(prev => [...prev, newMessage]);
        setMessageIndex(prev => prev + 1);
        
        if (newMessage.type === "incoming") {
          const newScore = calculateRiskScore(newMessage.text);
          setRiskScore(prev => Math.min(prev + newScore, 100));
        }
      }, 3000);
    }
    return () => {
      if (messageTimer) clearInterval(messageTimer);
    };
  }, [isCallActive, messageIndex]);

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

  const generateMessage = (index: number): MessageType => {
    const message = NATURAL_CONVERSATION[index % NATURAL_CONVERSATION.length];
    return {
      id: Date.now(),
      text: message.text,
      type: message.type as "incoming" | "outgoing",
      timestamp: new Date().toLocaleTimeString(),
    };
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
    setIsRinging(true);
    setTimeout(() => {
      setIsRinging(false);
      setIsCallActive(true);
      setMessages([]);
      setRiskScore(0);
      setShowWarning(false);
      setCallDuration(0);
      setMessageIndex(0);
    }, 2000);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setIsRinging(false);
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
        </header>

        <div className="p-4 space-y-4">
          <Card className={cn("glass-panel", isFlagged && "border-red-500/50")}>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                {isRinging && (
                  <div className="text-lg font-medium text-neutral-600 animate-pulse">
                    Ringing...
                  </div>
                )}
                {isCallActive && (
                  <div className="text-sm font-medium text-green-600">
                    Call in progress - {formatDuration(callDuration)}
                  </div>
                )}
                <h2 className="text-2xl font-medium mb-1">{callerName}</h2>
                <p className="text-sm text-neutral-500">
                  {currentNumber}
                  {isFlagged && (
                    <span className="ml-2 text-red-500">(Flagged)</span>
                  )}
                </p>
              </div>

              {isCallActive && messages.length > 0 && (
                <div className="mt-4 mb-8">
                  <TranscriptDisplay messages={messages} />
                  <ScamMeter score={riskScore} className="mt-4" />
                </div>
              )}

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
