import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check } from "lucide-react";

const Base64Page = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const encode = () => {
    try { setOutput(btoa(input)); setError(""); } catch { setError("Invalid input for encoding"); setOutput(""); }
  };
  const decode = () => {
    try { setOutput(atob(input)); setError(""); } catch { setError("Invalid Base64 string"); setOutput(""); }
  };
  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolPageLayout title="Base64 Encoder / Decoder" description="Encode and decode Base64 strings">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text or Base64 string..." className="input-dark w-full h-32 font-mono text-sm resize-none" />
        <div className="flex gap-3">
          <button onClick={encode} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">Encode</button>
          <button onClick={decode} className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">Decode</button>
        </div>
      </div>
      {error && <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in"><p className="text-sm text-destructive">{error}</p></div>}
      {output && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output</label>
            <button onClick={copyOutput} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default Base64Page;
