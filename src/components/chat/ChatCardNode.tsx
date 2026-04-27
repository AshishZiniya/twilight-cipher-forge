import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { Send, X, Bot, User, Copy, Check, RotateCcw, Pencil, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface CardMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatCardData {
  title: string;
  messages: CardMessage[];
  isLoading?: boolean;
  onSend: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onBranch: (id: string, fromMessageId: string) => void;
  [key: string]: unknown;
}

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group rounded-md overflow-hidden my-2 border border-border/60 nodrag">
      <div className="flex items-center justify-between px-3 py-1 bg-muted/80 border-b border-border/60">
        <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">{language || "code"}</span>
        <button onClick={copy} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, padding: "0.6rem 0.75rem", background: "hsl(var(--muted) / 0.5)", fontSize: "0.72rem", lineHeight: 1.5 }}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageBubble = ({
  msg,
  cardId,
  onBranch,
}: {
  msg: CardMessage;
  cardId: string;
  onBranch: (id: string, fromMessageId: string) => void;
}) => {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex gap-2 group">
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-accent text-accent-foreground border border-border"
        }`}
      >
        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="prose prose-xs dark:prose-invert max-w-none text-[12.5px] leading-relaxed text-foreground/90">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");
                if (match) return <CodeBlock language={match[1]} value={codeStr} />;
                return (
                  <code className="px-1 py-0.5 rounded bg-muted text-[11.5px] font-mono text-primary" {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity nodrag">
          <button onClick={copy} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            {copied ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
            Copy
          </button>
          {!isUser && (
            <button
              onClick={() => onBranch(cardId, msg.id)}
              className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Branch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatCardNode = ({ id, data, selected }: NodeProps) => {
  const d = data as ChatCardData;
  const [input, setInput] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(d.title);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [d.messages.length, d.isLoading]);

  const submit = useCallback(() => {
    const v = input.trim();
    if (!v || d.isLoading) return;
    d.onSend(id, v);
    setInput("");
  }, [input, d, id]);

  const saveTitle = () => {
    setEditingTitle(false);
    if (titleDraft.trim()) d.onRename(id, titleDraft.trim());
    else setTitleDraft(d.title);
  };

  return (
    <div
      className={`flex flex-col w-full h-full rounded-xl border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 transition-all overflow-hidden ${
        selected ? "border-primary/60 ring-2 ring-primary/30" : "border-border/70"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={240}
        lineClassName="!border-primary/40"
        handleClassName="!bg-primary !border-primary !w-2 !h-2 !rounded-sm"
      />
      <Handle type="target" position={Position.Left} className="!bg-primary !border-primary/50 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-primary !border-primary/50 !w-2 !h-2" />

      {/* Header (drag handle) */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-muted/40 cursor-move">
        <div className="w-5 h-5 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Bot className="w-3 h-3 text-primary" />
        </div>
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            className="flex-1 bg-transparent border-b border-primary/40 outline-none text-xs font-semibold text-foreground nodrag"
          />
        ) : (
          <>
            <span className="flex-1 text-xs font-semibold text-foreground truncate">{d.title}</span>
            <button
              onClick={() => setEditingTitle(true)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground nodrag"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </>
        )}
        <button
          onClick={() => d.onDelete(id)}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive nodrag"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 nowheel nodrag">
        {d.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">Start a conversation</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Ask anything. Branch from any reply to create a new exploration.
            </p>
          </div>
        ) : (
          d.messages.map((m) => <MessageBubble key={m.id} msg={m} cardId={id} onBranch={d.onBranch} />)
        )}
        {d.isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-md bg-accent border border-border flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
            </div>
            <div className="flex items-center gap-1 pt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border/60 bg-muted/30 nodrag">
        <div className="flex items-end gap-1.5 bg-background/60 border border-border rounded-lg px-2.5 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-xs text-foreground placeholder:text-muted-foreground min-h-[20px] max-h-[100px] py-0.5"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || d.isLoading}
            className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatCardNode);
