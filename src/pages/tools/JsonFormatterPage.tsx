import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check } from "lucide-react";

const JsonFormatterPage = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolPageLayout title="JSON Formatter" description="Beautify, minify, and validate JSON data">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">Input JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value", "nested": {"a": 1}}'
          className="input-dark w-full h-40 font-mono text-sm resize-none"
        />
        <div className="flex gap-3">
          <button onClick={format} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            Beautify
          </button>
          <button onClick={minify} className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            Minify
          </button>
        </div>
      </div>
      {error && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive font-mono">{error}</p>
        </div>
      )}
      {output && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output</label>
            <button onClick={copyOutput} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto max-h-96">{output}</pre>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default JsonFormatterPage;
