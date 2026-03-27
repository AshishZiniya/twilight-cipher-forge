import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Bot, RotateCcw } from "lucide-react";
import { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border/50">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "hsl(var(--muted) / 0.5)",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
        }}
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const ChatMessage = memo(({ message, onRetry }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 px-4 py-4 ${isUser ? "" : "bg-muted/30"}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-accent text-accent-foreground border border-border"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {isUser ? "You" : "XenCoder AI"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                if (match) {
                  return <CodeBlock language={match[1]} children={codeString} />;
                }
                return (
                  <code
                    className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground my-2">
                    {children}
                  </blockquote>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3">
                    <table className="w-full border-collapse border border-border text-sm">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return <td className="border border-border px-3 py-2">{children}</td>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {!isUser && onRetry && (
          <button
            onClick={() => onRetry(message.id)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
