
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneOff, AlertCircle, Flag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  onCallStart: () => void;
  onCallEnd: () => void;
  onFlag: () => void;
  isCallActive: boolean;
  isFlagged: boolean;
}

export function CallControls({ onCallStart, onCallEnd, onFlag, isCallActive, isFlagged }: CallControlsProps) {
  const [isRequestingMic, setIsRequestingMic] = useState(false);

  const handleStartCall = async () => {
    setIsRequestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onCallStart();
      toast.success("Call started");
    } catch (err) {
      toast.error("Could not access microphone");
      console.error("Error accessing microphone:", err);
    } finally {
      setIsRequestingMic(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
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
      
      <Button
        variant="outline"
        onClick={onFlag}
        className={cn(
          "rounded-full h-16 w-16 p-0",
          isFlagged && "bg-red-500 hover:bg-red-600 text-white border-0"
        )}
      >
        <Flag className="h-6 w-6" />
      </Button>
    </div>
  );
}
