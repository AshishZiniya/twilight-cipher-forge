import { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { ArrowLeftRight, Eraser } from "lucide-react";

type Op = "equal" | "insert" | "delete";
type Diff = { op: Op; value: string };

// Classic Myers-style LCS diff on lines
function diffLines(a: string[], b: string[]): Diff[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: Diff[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ op: "equal", value: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ op: "delete", value: a[i] }); i++; }
    else { out.push({ op: "insert", value: b[j] }); j++; }
  }
  while (i < n) { out.push({ op: "delete", value: a[i++] }); }
  while (j < m) { out.push({ op: "insert", value: b[j++] }); }
  return out;
}

const opStyle: Record<Op, string> = {
  equal: "text-foreground/70",
  insert: "bg-success/10 border-l-2 border-success text-foreground",
  delete: "bg-destructive/10 border-l-2 border-destructive text-foreground",
};
const sign: Record<Op, string> = { equal: " ", insert: "+", delete: "−" };

const DiffCheckerPage = () => {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [view, setView] = useState<"split" | "unified">("unified");
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const norm = (s: string) => {
    let v = s;
    if (ignoreWs) v = v.replace(/\s+/g, " ").trim();
    if (ignoreCase) v = v.toLowerCase();
    return v;
  };

  const diffs = useMemo(() => {
    const la = a.split("\n");
    const lb = b.split("\n");
    const na = la.map(norm);
    const nb = lb.map(norm);
    const raw = diffLines(na, nb);
    // map back to original strings
    let ai = 0, bi = 0;
    return raw.map((d) => {
      if (d.op === "equal") { const v = la[ai]; ai++; bi++; return { op: d.op, value: v }; }
      if (d.op === "delete") { const v = la[ai]; ai++; return { op: d.op, value: v }; }
      const v = lb[bi]; bi++; return { op: d.op, value: v };
    });
  }, [a, b, ignoreWs, ignoreCase]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    diffs.forEach((d) => { if (d.op === "insert") added++; else if (d.op === "delete") removed++; });
    return { added, removed };
  }, [diffs]);

  // Build split rows
  const splitRows = useMemo(() => {
    const rows: { left?: { op: Op; value: string }; right?: { op: Op; value: string } }[] = [];
    for (let i = 0; i < diffs.length; i++) {
      const d = diffs[i];
      if (d.op === "equal") rows.push({ left: { op: "equal", value: d.value }, right: { op: "equal", value: d.value } });
      else if (d.op === "delete") {
        // pair with following insert if present
        const next = diffs[i + 1];
        if (next && next.op === "insert") {
          rows.push({ left: { op: "delete", value: d.value }, right: { op: "insert", value: next.value } });
          i++;
        } else rows.push({ left: { op: "delete", value: d.value } });
      } else rows.push({ right: { op: "insert", value: d.value } });
    }
    return rows;
  }, [diffs]);

  return (
    <ToolPageLayout title="Diff Checker" description="Compare two texts with line-level diff and unified or side-by-side views">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6 space-y-3">
          <label className="text-sm font-medium text-foreground">Original</label>
          <textarea value={a} onChange={(e) => setA(e.target.value)} placeholder="Paste original text…" className="input-dark w-full h-48 font-mono text-sm resize-none" />
        </div>
        <div className="glass rounded-xl p-6 space-y-3">
          <label className="text-sm font-medium text-foreground">Modified</label>
          <textarea value={b} onChange={(e) => setB(e.target.value)} placeholder="Paste modified text…" className="input-dark w-full h-48 font-mono text-sm resize-none" />
        </div>
      </div>

      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(["unified", "split"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>{v}</button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={ignoreWs} onChange={(e) => setIgnoreWs(e.target.checked)} className="accent-primary" /> Ignore whitespace
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="accent-primary" /> Ignore case
        </label>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-success">+{stats.added}</span>
          <span className="text-destructive">−{stats.removed}</span>
          <button onClick={() => { const x = a; setA(b); setB(x); }} className="inline-flex items-center gap-1.5 px-2 py-1 text-muted-foreground hover:text-foreground"><ArrowLeftRight className="w-3.5 h-3.5" /> Swap</button>
          <button onClick={() => { setA(""); setB(""); }} className="inline-flex items-center gap-1.5 px-2 py-1 text-muted-foreground hover:text-foreground"><Eraser className="w-3.5 h-3.5" /> Clear</button>
        </div>
      </div>

      {(a || b) && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          {view === "unified" ? (
            <div className="font-mono text-sm overflow-auto max-h-[32rem] space-y-0.5">
              {diffs.map((d, i) => (
                <div key={i} className={`px-3 py-0.5 rounded ${opStyle[d.op]}`}>
                  <span className="inline-block w-4 text-muted-foreground">{sign[d.op]}</span>
                  <span className="whitespace-pre-wrap">{d.value || " "}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-sm overflow-auto max-h-[32rem] grid grid-cols-2 gap-x-3">
              {splitRows.flatMap((r, i) => [
                <div key={`l${i}`} className={`px-3 py-0.5 rounded ${r.left ? opStyle[r.left.op] : ""}`}>
                  <span className="whitespace-pre-wrap">{r.left?.value ?? " "}</span>
                </div>,
                <div key={`r${i}`} className={`px-3 py-0.5 rounded ${r.right ? opStyle[r.right.op] : ""}`}>
                  <span className="whitespace-pre-wrap">{r.right?.value ?? " "}</span>
                </div>,
              ])}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default DiffCheckerPage;
