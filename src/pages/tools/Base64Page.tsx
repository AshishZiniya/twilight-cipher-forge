import { useMemo, useRef, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check, ArrowDownUp, Upload, Eraser } from "lucide-react";

type Mode = "encode" | "decode";

// UTF-8-safe base64
function utf8ToBase64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function base64ToUtf8(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function toUrlSafe(b64: string) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromUrlSafe(b64: string) {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return s;
}

const Base64Page = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        const b = utf8ToBase64(input);
        return { output: urlSafe ? toUrlSafe(b) : b, error: "" };
      }
      return { output: base64ToUtf8(urlSafe ? fromUrlSafe(input) : input), error: "" };
    } catch (e: any) {
      return { output: "", error: e?.message || "Invalid Base64 string" };
    }
  }, [input, mode, urlSafe]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${b64}`;
    setMode("encode");
    setInput(`[file:${file.name}]`);
    setTimeout(() => copy(dataUri), 0);
    // surface result via output panel
    setOverride(dataUri);
  };
  const [override, setOverride] = useState("");

  const finalOutput = override || output;
  const inputBytes = new Blob([input]).size;
  const outputBytes = finalOutput ? new Blob([finalOutput]).size : 0;

  return (
    <ToolPageLayout title="Base64 Encoder / Decoder" description="UTF-8-safe Base64, URL-safe variant, and file→data URI">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["encode", "decode"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setOverride(""); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{m}</button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="accent-primary" />
            URL-safe
          </label>
          <div className="ml-auto flex items-center gap-2">
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Upload className="w-3.5 h-3.5" /> File → Base64
            </button>
            <button onClick={() => { if (output) { setInput(output); setMode(mode === "encode" ? "decode" : "encode"); setOverride(""); } }}
              disabled={!output} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
              <ArrowDownUp className="w-3.5 h-3.5" /> Swap
            </button>
            <button onClick={() => { setInput(""); setOverride(""); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setOverride(""); }}
            placeholder={mode === "encode" ? "Enter plain text…" : "Paste a Base64 string…"}
            className="input-dark w-full h-32 font-mono text-sm resize-none mt-2" />
          <p className="text-xs text-muted-foreground mt-1">{inputBytes} bytes</p>
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {finalOutput && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output</label>
            <button onClick={() => copy(finalOutput)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto whitespace-pre-wrap break-all max-h-96">{finalOutput}</pre>
          <p className="text-xs text-muted-foreground">{outputBytes} bytes</p>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default Base64Page;
