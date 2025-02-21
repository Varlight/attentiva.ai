import { useState, useEffect } from "react";
import { CallControls } from "@/components/CallControls";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { ScamMeter } from "@/components/ScamMeter";
import { RiskAlert } from "@/components/RiskAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Signal, Battery, Wifi } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

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

export default function Index() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  
  // Simulate incoming messages during call
  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    
    if (isCallActive) {
      messageInterval = setInterval(() => {
        setMessages(prev => [...prev, generateMessage(true)]);
        setRiskScore(prev => Math.min(100, prev + Math.random() * 15));
      }, 3000);
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [isCallActive]);

  const handleCallStart = () => {
    setIsCallActive(true);
    setMessages([]);
    setRiskScore(0);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setRiskScore(0);
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
          <span className="text-xs text-neutral-400">Pro</span>
        </header>

        <div className="p-4 space-y-4">
          <Card className="glass-panel">
            <CardContent className="p-4">
              <CallControls
                isCallActive={isCallActive}
                onCallStart={handleCallStart}
                onCallEnd={handleCallEnd}
              />
            </CardContent>
          </Card>

          {isCallActive && (
            <>
              <Card className="glass-panel">
                <CardContent className="p-4 space-y-4">
                  <ScamMeter score={riskScore} />
                  <TranscriptDisplay messages={messages} />
                </CardContent>
              </Card>

              <RiskAlert isOpen={riskScore >= 50} score={riskScore} />
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
