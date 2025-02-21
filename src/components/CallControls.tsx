
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
          className="bg-success hover:bg-success-hover transition-colors rounded-full h-16 w-16 p-0"
        >
          <PhoneCall className="h-6 w-6" />
        </Button>
      ) : (
        <div className="flex gap-4">
          <Button
            onClick={onCallEnd}
            variant="destructive"
            className="bg-danger hover:bg-danger-hover transition-colors rounded-full h-16 w-16 p-0"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast("Reported as scam")}
            className="rounded-full h-16 w-16 p-0"
          >
            <AlertCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
