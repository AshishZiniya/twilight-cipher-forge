import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";

function computeDiff(a: string, b: string) {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const maxLen = Math.max(linesA.length, linesB.length);
  const result: { lineA: string; lineB: string; type: "same" | "changed" | "added" | "removed" }[] = [];

  for (let i = 0; i < maxLen; i++) {
    const la = linesA[i];
    const lb = linesB[i];
    if (la === undefined) result.push({ lineA: "", lineB: lb, type: "added" });
    else if (lb === undefined) result.push({ lineA: la, lineB: "", type: "removed" });
    else if (la === lb) result.push({ lineA: la, lineB: lb, type: "same" });
    else result.push({ lineA: la, lineB: lb, type: "changed" });
  }
  return result;
}

const colors = {
  same: "",
  changed: "bg-warning/10 border-l-2 border-warning",
  added: "bg-success/10 border-l-2 border-success",
  removed: "bg-destructive/10 border-l-2 border-destructive",
};

const DiffCheckerPage = () => {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diff, setDiff] = useState<ReturnType<typeof computeDiff>>([]);

  return (
    <ToolPageLayout title="Diff Checker" description="Compare two texts and highlight differences">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6 space-y-3">
          <label className="text-sm font-medium text-foreground">Original</label>
          <textarea value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Paste original text..." className="input-dark w-full h-48 font-mono text-sm resize-none" />
        </div>
        <div className="glass rounded-xl p-6 space-y-3">
          <label className="text-sm font-medium text-foreground">Modified</label>
          <textarea value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Paste modified text..." className="input-dark w-full h-48 font-mono text-sm resize-none" />
        </div>
      </div>
      <button onClick={() => setDiff(computeDiff(textA, textB))} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
        Compare
      </button>
      {diff.length > 0 && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Results</h3>
          <div className="space-y-0.5 font-mono text-sm max-h-96 overflow-auto">
            {diff.map((d, i) => (
              <div key={i} className={`grid grid-cols-2 gap-4 px-3 py-1 rounded ${colors[d.type]}`}>
                <span className="text-foreground/80">{d.lineA}</span>
                <span className="text-foreground/80">{d.lineB}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default DiffCheckerPage;
