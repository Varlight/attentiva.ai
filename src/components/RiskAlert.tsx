
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface RiskAlertProps {
  isOpen: boolean;
  score: number;
}

export function RiskAlert({ isOpen, score }: RiskAlertProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-danger/95 text-white animate-risk-alert">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            High Risk Call Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/90">
            This call has a risk score of {score}%. Exercise extreme caution and consider ending the call.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
