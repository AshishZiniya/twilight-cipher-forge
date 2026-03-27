import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { Message } from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ConversationSidebar, { Conversation } from "@/components/chat/ConversationSidebar";
import { Bot, PanelLeftClose, PanelLeft } from "lucide-react";

// Simulated AI responses for demo
const AI_RESPONSES: Record<string, string> = {
  default: `I'm **XenCoder AI**, your developer assistant! I can help you with:

- 🔧 **Code debugging** and problem solving
- 📝 **Code generation** in any language
- 🧠 **Technical explanations** and concepts
- 🔍 **Code review** and best practices
- 🗄️ **Database queries** and optimization

Just ask me anything!`,
  jwt: `## How JWT Tokens Work

A **JSON Web Token (JWT)** consists of three parts separated by dots:

\`\`\`
header.payload.signature
\`\`\`

### 1. Header
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

### 2. Payload
Contains **claims** — statements about the user:
\`\`\`json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
\`\`\`

### 3. Signature
\`\`\`javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

> **Important**: JWTs are *signed*, not encrypted. Anyone can decode the payload — never store secrets in it!

| Claim | Description |
|-------|-------------|
| \`sub\` | Subject (user ID) |
| \`iat\` | Issued at time |
| \`exp\` | Expiration time |
| \`iss\` | Issuer |`,
  sql: `## Finding Duplicate Rows in SQL

Here's how to find duplicate rows based on specific columns:

\`\`\`sql
SELECT column1, column2, COUNT(*) as count
FROM your_table
GROUP BY column1, column2
HAVING COUNT(*) > 1
ORDER BY count DESC;
\`\`\`

### To see all duplicate rows with their data:

\`\`\`sql
WITH duplicates AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY column1, column2
      ORDER BY id
    ) AS row_num
  FROM your_table
)
SELECT * FROM duplicates
WHERE row_num > 1;
\`\`\`

### Delete duplicates keeping the first occurrence:

\`\`\`sql
DELETE FROM your_table
WHERE id NOT IN (
  SELECT MIN(id)
  FROM your_table
  GROUP BY column1, column2
);
\`\`\``,
  regex: `## Email Validation Regex

Here's a practical regex for email validation:

\`\`\`javascript
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Usage
function validateEmail(email) {
  return emailRegex.test(email);
}

console.log(validateEmail("user@example.com")); // true
console.log(validateEmail("invalid@")); // false
\`\`\`

### Breakdown:
- \`^[a-zA-Z0-9.!#$%&'*+/=?^_\\\`{|}~-]+\` — Local part
- \`@\` — Required separator
- \`[a-zA-Z0-9](?:...)*$\` — Domain part

> ⚠️ For production, prefer server-side validation or the HTML5 \`type="email"\` attribute.`,
  cors: `## Debugging CORS Errors

**CORS** (Cross-Origin Resource Sharing) errors occur when a browser blocks requests to a different origin.

### Common Error:
\`\`\`
Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000' 
has been blocked by CORS policy
\`\`\`

### Fix on the Server:

\`\`\`javascript
// Express.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
\`\`\`

### Quick Checklist:
1. ✅ Server sends \`Access-Control-Allow-Origin\` header
2. ✅ Preflight (\`OPTIONS\`) requests are handled
3. ✅ Credentials mode matches between client and server
4. ✅ Allowed methods include your HTTP method
5. ✅ Custom headers are listed in \`Access-Control-Allow-Headers\``,
  bigo: `## Big O Notation Explained

Big O describes how an algorithm's runtime **scales** with input size.

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Hash map lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Array scan |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Fibonacci (naive) |

### Examples:

\`\`\`python
# O(1) — Constant
def get_first(arr):
    return arr[0]

# O(n) — Linear
def find_max(arr):
    max_val = arr[0]
    for item in arr:
        if item > max_val:
            max_val = item
    return max_val

# O(n²) — Quadratic
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - 1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]

# O(log n) — Logarithmic
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
\`\`\`

> **Rule of thumb**: Drop constants and lower-order terms. O(2n + 5) → O(n)`,
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("jwt")) return AI_RESPONSES.jwt;
  if (lower.includes("sql") || lower.includes("duplicate")) return AI_RESPONSES.sql;
  if (lower.includes("regex") || lower.includes("email")) return AI_RESPONSES.regex;
  if (lower.includes("cors")) return AI_RESPONSES.cors;
  if (lower.includes("big o") || lower.includes("notation") || lower.includes("complexity")) return AI_RESPONSES.bigo;
  
  return `Great question! Here's what I think about "${input.slice(0, 60)}${input.length > 60 ? '...' : ''}":

This is a **demo response** from XenCoder AI. In production, this would connect to an AI API for real responses.

Some things I can help with:

\`\`\`javascript
// Example code assistance
function solve(problem) {
  const analysis = analyze(problem);
  const solution = generate(analysis);
  return optimize(solution);
}
\`\`\`

> 💡 **Tip**: Try asking about JWT, SQL, CORS, Regex, or Big O notation for detailed demo responses!`;
}

function generateTitle(content: string): string {
  const words = content.split(/\s+/).slice(0, 5).join(" ");
  return words.length > 40 ? words.slice(0, 40) + "..." : words;
}

const ChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeConvId ? messages[activeConvId] || [] : [];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, scrollToBottom]);

  const createConversation = useCallback(() => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
    };
    setConversations((prev) => [conv, ...prev]);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    setActiveConvId(id);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      let convId = activeConvId;
      if (!convId) {
        convId = crypto.randomUUID();
        const conv: Conversation = {
          id: convId,
          title: generateTitle(content),
          lastMessage: content,
          timestamp: new Date(),
          messageCount: 0,
        };
        setConversations((prev) => [conv, ...prev]);
        setMessages((prev) => ({ ...prev, [convId!]: [] }));
        setActiveConvId(convId);
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [convId!]: [...(prev[convId!] || []), userMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title: c.title === "New Chat" ? generateTitle(content) : c.title,
                lastMessage: content,
                timestamp: new Date(),
                messageCount: c.messageCount + 1,
              }
            : c
        )
      );

      setIsLoading(true);

      // Simulate AI response with typing delay
      const responseTime = 800 + Math.random() * 1200;
      setTimeout(() => {
        const aiResponse = getAIResponse(content);
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => ({
          ...prev,
          [convId!]: [...(prev[convId!] || []), aiMsg],
        }));
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messageCount: c.messageCount + 2 }
              : c
          )
        );
        setIsLoading(false);
      }, responseTime);
    },
    [activeConvId]
  );

  const handleDelete = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveConvId((prev) => (prev === id ? null : prev));
  }, []);

  const handleRetry = useCallback(
    (messageId: string) => {
      if (!activeConvId) return;
      const msgs = messages[activeConvId] || [];
      const idx = msgs.findIndex((m) => m.id === messageId);
      if (idx <= 0) return;
      const userMsg = msgs[idx - 1];
      if (userMsg.role !== "user") return;

      // Remove old assistant message and resend
      setMessages((prev) => ({
        ...prev,
        [activeConvId]: prev[activeConvId].slice(0, idx),
      }));

      setTimeout(() => handleSend(userMsg.content), 100);
    },
    [activeConvId, messages, handleSend]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 bg-background">
      {sidebarOpen && (
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConvId}
          onSelect={setActiveConvId}
          onNew={createConversation}
          onDelete={handleDelete}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">XenCoder AI</h2>
              <p className="text-[10px] text-muted-foreground">Developer Assistant</p>
            </div>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Welcome to XenCoder AI
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
                Your intelligent developer assistant. Ask me about code, debugging,
                architecture, algorithms, or any technical topic.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  { icon: "🔧", title: "Debug Code", desc: "Find and fix issues in your code" },
                  { icon: "📝", title: "Write Code", desc: "Generate code in any language" },
                  { icon: "🧠", title: "Learn Concepts", desc: "Understand technical topics" },
                  { icon: "⚡", title: "Optimize", desc: "Improve performance and quality" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-default"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {activeMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRetry={msg.role === "assistant" ? handleRetry : undefined}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3 px-4 py-4 bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-accent border border-border flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          onStop={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default ChatPage;
