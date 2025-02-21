
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScamMeterProps {
  score: number;
  className?: string;
}

export function ScamMeter({ score, className }: ScamMeterProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-orange-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Risk Level</span>
        <span className="text-sm font-medium">{score}%</span>
      </div>
      <Progress
        value={displayScore}
        className={cn("h-2 transition-all duration-500", getColor(score))}
      />
    </div>
  );
}
