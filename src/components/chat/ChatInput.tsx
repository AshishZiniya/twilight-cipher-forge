import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Paperclip, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const SUGGESTIONS = [
  "Explain how JWT tokens work",
  "Write a SQL query to find duplicate rows",
  "Convert this JSON to TypeScript interface",
  "Help me debug a CORS error",
  "Generate a regex for email validation",
  "Explain Big O notation with examples",
];

const ChatInput = ({ onSend, onStop, isLoading, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  const handleSuggestion = (text: string) => {
    onSend(text);
    setShowSuggestions(false);
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {showSuggestions && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-end gap-2 bg-muted/50 border border-border rounded-xl px-4 py-3 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask XenCoder AI anything..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-[200px]"
          />
          <div className="flex items-center gap-1">
            {isLoading ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={onStop}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim() || disabled}
                className="h-8 w-8 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          XenCoder AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
