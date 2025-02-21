
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneOff, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface CallControlsProps {
  onCallStart: () => void;
  onCallEnd: () => void;
  isCallActive: boolean;
}

export function CallControls({ onCallStart, onCallEnd, isCallActive }: CallControlsProps) {
  const [isRequestingMic, setIsRequestingMic] = useState(false);

  const handleStartCall = async () => {
    setIsRequestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onCallStart();
      toast.success("Microphone access granted");
    } catch (err) {
      toast.error("Could not access microphone");
      console.error("Error accessing microphone:", err);
    } finally {
      setIsRequestingMic(false);
    }
  };

  return (
    <div className="flex gap-4 items-center justify-center">
      {!isCallActive ? (
        <Button
          onClick={handleStartCall}
          disabled={isRequestingMic}
          className="bg-success hover:bg-success-hover transition-colors"
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Start Call
        </Button>
      ) : (
        <Button
          onClick={onCallEnd}
          variant="destructive"
          className="bg-danger hover:bg-danger-hover transition-colors"
        >
          <PhoneOff className="mr-2 h-4 w-4" />
          End Call
        </Button>
      )}
      {isCallActive && (
        <Button variant="outline" onClick={() => toast.message("Reported as scam")}>
          <AlertCircle className="mr-2 h-4 w-4" />
          Report Scam
        </Button>
      )}
    </div>
  );
}
