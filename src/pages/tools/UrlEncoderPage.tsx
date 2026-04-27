import { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check, ArrowDownUp, Eraser } from "lucide-react";

type Mode = "encode" | "decode";
type Variant = "component" | "uri";

const UrlEncoderPage = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [variant, setVariant] = useState<Variant>("component");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        return { output: variant === "component" ? encodeURIComponent(input) : encodeURI(input), error: "" };
      }
      return { output: variant === "component" ? decodeURIComponent(input) : decodeURI(input), error: "" };
    } catch (e: any) {
      return { output: "", error: e?.message || "Invalid input" };
    }
  }, [input, mode, variant]);

  const parsed = useMemo(() => {
    const candidate = mode === "decode" ? output : input;
    if (!candidate) return null;
    try {
      const u = new URL(candidate);
      const params: { key: string; value: string }[] = [];
      u.searchParams.forEach((value, key) => params.push({ key, value }));
      return {
        protocol: u.protocol.replace(":", ""),
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hash: u.hash,
        params,
      };
    } catch {
      return null;
    }
  }, [input, output, mode]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <ToolPageLayout title="URL Encoder / Decoder" description="Encode, decode, and inspect URLs in real time">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["encode", "decode"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["component", "uri"] as Variant[]).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-colors ${
                  variant === v ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title={v === "component" ? "encodeURIComponent — escapes everything" : "encodeURI — preserves URL structure"}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={swap} disabled={!output} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
              <ArrowDownUp className="w-3.5 h-3.5" /> Swap
            </button>
            <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "https://example.com/search?q=hello world" : "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"}
            className="input-dark w-full h-32 font-mono text-sm resize-none mt-2"
          />
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {output && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output ({mode === "encode" ? "encoded" : "decoded"})</label>
            <button onClick={() => copy(output)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}

      {parsed && (
        <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground">URL Components</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Protocol", parsed.protocol],
              ["Host", parsed.host],
              ["Hostname", parsed.hostname],
              ["Port", parsed.port || "—"],
              ["Pathname", parsed.pathname || "/"],
              ["Hash", parsed.hash || "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface rounded-lg p-3">
                <p className="text-xs font-semibold text-primary">{k}</p>
                <p className="font-mono text-foreground mt-0.5 break-all">{v}</p>
              </div>
            ))}
          </div>
          {parsed.params.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-primary mb-2">Query parameters</p>
              <div className="bg-surface rounded-lg divide-y divide-border">
                {parsed.params.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr] gap-3 px-3 py-2 text-sm font-mono">
                    <span className="text-foreground">{p.key}</span>
                    <span className="text-muted-foreground break-all">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default UrlEncoderPage;
