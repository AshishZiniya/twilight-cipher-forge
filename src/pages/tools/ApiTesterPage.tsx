import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Send, Loader2 } from "lucide-react";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const ApiTesterPage = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<Method>("GET");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [response, setResponse] = useState<{ status: number; statusText: string; body: string; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResponse(null);
    const start = performance.now();
    try {
      let parsedHeaders: Record<string, string> = {};
      try { parsedHeaders = JSON.parse(headers); } catch {}
      
      const opts: RequestInit = { method, headers: parsedHeaders };
      if (method !== "GET" && body) opts.body = body;
      
      const res = await fetch(url, opts);
      const text = await res.text();
      const time = Math.round(performance.now() - start);
      
      let formattedBody = text;
      try { formattedBody = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      
      setResponse({ status: res.status, statusText: res.statusText, body: formattedBody, time });
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = response
    ? response.status < 300 ? "text-success" : response.status < 400 ? "text-warning" : "text-destructive"
    : "";

  return (
    <ToolPageLayout title="API Tester" description="Send HTTP requests and inspect responses">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex gap-3">
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="input-dark font-mono text-sm font-semibold w-28">
            {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/data" className="input-dark flex-1 font-mono text-sm" />
          <button onClick={send} disabled={loading} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Headers (JSON)</label>
            <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} className="input-dark w-full h-20 font-mono text-xs resize-none mt-1" />
          </div>
          {method !== "GET" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}' className="input-dark w-full h-24 font-mono text-xs resize-none mt-1" />
            </div>
          )}
        </div>
      </div>

      {error && <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in"><p className="text-sm text-destructive">{error}</p></div>}

      {response && (
        <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <span className={`font-mono font-bold text-lg ${statusColor}`}>{response.status}</span>
            <span className="text-sm text-muted-foreground">{response.statusText}</span>
            <span className="text-xs text-muted-foreground ml-auto">{response.time}ms</span>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto max-h-96">{response.body}</pre>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default ApiTesterPage;
