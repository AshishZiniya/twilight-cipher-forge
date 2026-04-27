import { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check, Eraser, Download } from "lucide-react";

function sortKeys(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc: any, k) => { acc[k] = sortKeys(value[k]); return acc; }, {});
  }
  return value;
}

function countNodes(v: any): { keys: number; arrays: number; depth: number } {
  let keys = 0, arrays = 0, depth = 0;
  const walk = (x: any, d: number) => {
    depth = Math.max(depth, d);
    if (Array.isArray(x)) { arrays++; x.forEach((i) => walk(i, d + 1)); }
    else if (x && typeof x === "object") { const ks = Object.keys(x); keys += ks.length; ks.forEach((k) => walk(x[k], d + 1)); }
  };
  walk(v, 0);
  return { keys, arrays, depth };
}

const JsonFormatterPage = () => {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4 | 0>(2); // 0 = tab
  const [sortKeysOn, setSortKeysOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, error, stats } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "", stats: null as any };
    try {
      let parsed = JSON.parse(input);
      if (sortKeysOn) parsed = sortKeys(parsed);
      const indentValue = indent === 0 ? "\t" : indent;
      return { output: JSON.stringify(parsed, null, indentValue), error: "", stats: countNodes(parsed) };
    } catch (e: any) {
      return { output: "", error: e.message, stats: null };
    }
  }, [input, indent, sortKeysOn]);

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(sortKeysOn ? sortKeys(parsed) : parsed));
    } catch { /* ignore */ }
  };

  const escape = () => {
    try {
      JSON.parse(input);
      navigator.clipboard.writeText(JSON.stringify(input));
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "formatted.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const copyOut = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolPageLayout title="JSON Formatter" description="Beautify, minify, sort, validate & inspect JSON">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {([2, 4, 0] as const).map((n) => (
              <button key={n} onClick={() => setIndent(n)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  indent === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{n === 0 ? "Tab" : `${n} sp`}</button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={sortKeysOn} onChange={(e) => setSortKeysOn(e.target.checked)} className="accent-primary" />
            Sort keys
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={minify} disabled={!output} className="px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">Minify</button>
            <button onClick={escape} disabled={!output} className="px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">Copy as escaped</button>
            <button onClick={() => setInput("")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Input JSON</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value", "nested": {"a": 1}}'
            className={`input-dark w-full h-48 font-mono text-sm resize-none mt-2 ${error ? "border-destructive/50" : ""}`} />
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive font-mono">{error}</p>
        </div>
      )}

      {output && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Output</label>
              {stats && (
                <span className="text-xs text-muted-foreground font-mono">
                  {stats.keys} keys · {stats.arrays} arrays · depth {stats.depth} · {output.length} chars
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={download} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button onClick={copyOut} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto max-h-[32rem]">{output}</pre>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default JsonFormatterPage;
