import { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check, Eraser } from "lucide-react";

const KEYWORDS = [
  "SELECT","FROM","WHERE","AND","OR","NOT","JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN","OUTER JOIN","FULL JOIN","CROSS JOIN",
  "ON","USING","GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM",
  "CREATE TABLE","CREATE INDEX","ALTER TABLE","DROP TABLE","TRUNCATE","AS","DISTINCT","UNION","UNION ALL","EXCEPT","INTERSECT",
  "IN","NOT IN","EXISTS","BETWEEN","LIKE","ILIKE","IS NULL","IS NOT NULL","ASC","DESC","CASE","WHEN","THEN","ELSE","END",
  "WITH","RETURNING","PRIMARY KEY","FOREIGN KEY","REFERENCES","DEFAULT","NULL","TRUE","FALSE",
];
const NEWLINE_BEFORE = ["SELECT","FROM","WHERE","GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN","OUTER JOIN","FULL JOIN","CROSS JOIN","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","UNION","UNION ALL","EXCEPT","INTERSECT","WITH","RETURNING"];

function format(sql: string, indentSize: number, kwCase: "upper" | "lower"): string {
  let s = sql.replace(/\s+/g, " ").trim();
  // newlines before major keywords
  for (const kw of NEWLINE_BEFORE) {
    const re = new RegExp(`\\s\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    s = s.replace(re, `\n${kw}`);
  }
  // newlines after AND/OR
  s = s.replace(/\s+\b(AND|OR)\b/gi, `\n${" ".repeat(indentSize)}$1`);
  // commas in select lists -> newline indent (only between SELECT and FROM)
  s = s.replace(/,(?=\s)/g, `,\n${" ".repeat(indentSize)}`);
  // case
  for (const kw of KEYWORDS) {
    const re = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    s = s.replace(re, kwCase === "upper" ? kw : kw.toLowerCase());
  }
  return s.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
}

function minify(sql: string) { return sql.replace(/\s+/g, " ").trim(); }

const SqlFormatterPage = () => {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [kwCase, setKwCase] = useState<"upper" | "lower">("upper");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return mode === "minify" ? minify(input) : format(input, indent, kwCase);
  }, [input, indent, kwCase, mode]);

  const stats = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const statements = trimmed.split(";").filter((s) => s.trim()).length;
    return { statements, chars: input.length, lines: input.split("\n").length };
  }, [input]);

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <ToolPageLayout title="SQL Formatter" description="Beautify, minify, and standardise SQL queries">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["format", "minify"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{m}</button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {([2, 4] as const).map((n) => (
              <button key={n} onClick={() => setIndent(n)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  indent === n ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{n} sp</button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["upper", "lower"] as const).map((c) => (
              <button key={c} onClick={() => setKwCase(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-colors ${
                  kwCase === c ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{c}</button>
            ))}
          </div>
          <button onClick={() => setInput("")} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Eraser className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">SQL Query</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="select id, name from users u left join orders o on o.user_id = u.id where u.active = true order by u.name"
            className="input-dark w-full h-40 font-mono text-sm resize-none mt-2" />
          {stats && <p className="text-xs text-muted-foreground mt-1">{stats.statements} statement(s) · {stats.lines} lines · {stats.chars} chars</p>}
        </div>
      </div>

      {output && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">{mode === "minify" ? "Minified" : "Formatted"} SQL</label>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto max-h-[32rem] whitespace-pre">{output}</pre>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default SqlFormatterPage;
