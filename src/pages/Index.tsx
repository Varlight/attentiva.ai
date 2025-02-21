
import { useState, useEffect } from "react";
import { CallControls } from "@/components/CallControls";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { ScamMeter } from "@/components/ScamMeter";
import { RiskAlert } from "@/components/RiskAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

// Simulated transcript messages for demo
const generateMessage = (isIncoming: boolean) => {
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
    type: isIncoming ? "incoming" : "outgoing" as const,
    timestamp: new Date().toLocaleTimeString(),
  };
};

export default function Index() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: number;
    text: string;
    type: "incoming" | "outgoing";
    timestamp: string;
  }>>([]);
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
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold">Scam Call Detection</h1>
          </div>
          <p className="text-neutral-600">Real-time scam detection for your safety</p>
        </header>

        <Card className="glass-panel">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg">Call Controls</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CallControls
              isCallActive={isCallActive}
              onCallStart={handleCallStart}
              onCallEnd={handleCallEnd}
            />
          </CardContent>
        </Card>

        {isCallActive && (
          <>
            <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
              <Card className="glass-panel">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg">Live Transcript</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <TranscriptDisplay messages={messages} />
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ScamMeter score={riskScore} />
                </CardContent>
              </Card>
            </div>

            <RiskAlert isOpen={riskScore >= 50} score={riskScore} />
          </>
        )}
      </div>
    </div>
  );
}
