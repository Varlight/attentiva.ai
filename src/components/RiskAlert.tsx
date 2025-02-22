
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface RiskAlertProps {
  isOpen: boolean;
  score: number;
  onIgnore: () => void;
}

export function RiskAlert({ isOpen, score, onIgnore }: RiskAlertProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-danger text-white fixed bottom-4 left-4 right-4 p-4 rounded-xl max-w-none">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Level: {score}%
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/90 text-sm">
            This call shows signs of potential fraud. Stay alert.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <Button 
            variant="outline" 
            onClick={onIgnore}
            className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Ignore Warning
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
