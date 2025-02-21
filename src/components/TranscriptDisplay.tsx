
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TranscriptDisplayProps {
  messages: Array<{
    id: number;
    text: string;
    type: "incoming" | "outgoing";
    timestamp: string;
  }>;
  className?: string;
}

export function TranscriptDisplay({ messages, className }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className={cn("h-[calc(100vh-400px)] rounded-lg border-0", className)}>
      <div className="p-4 space-y-3" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[85%] space-y-1",
              message.type === "incoming" ? "ml-0" : "ml-auto"
            )}
          >
            <div
              className={cn(
                "rounded-2xl px-4 py-2 animate-fade-in text-sm",
                message.type === "incoming"
                  ? "bg-neutral-100 text-neutral-900"
                  : "bg-blue-500 text-white ml-auto"
              )}
            >
              {message.text}
            </div>
            <span className="text-[10px] text-neutral-400">{message.timestamp}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
