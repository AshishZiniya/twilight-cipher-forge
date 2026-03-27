import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check } from "lucide-react";

function formatSQL(sql: string): string {
  const keywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "AS", "DISTINCT", "UNION", "EXCEPT", "INTERSECT", "IN", "NOT IN", "EXISTS", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL", "ASC", "DESC", "CASE", "WHEN", "THEN", "ELSE", "END"];
  
  let formatted = sql.trim();
  // Add newlines before major keywords
  const majorKw = ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "UNION", "EXCEPT", "INTERSECT"];
  majorKw.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    formatted = formatted.replace(regex, `\n${kw}`);
  });
  // Add newlines after AND/OR  
  formatted = formatted.replace(/\b(AND|OR)\b/gi, "\n  $1");
  // Clean up
  formatted = formatted.replace(/^\n/, "").replace(/\n{3,}/g, "\n\n");
  // Uppercase keywords
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    formatted = formatted.replace(regex, kw);
  });
  return formatted;
}

const SqlFormatterPage = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => setOutput(formatSQL(input));
  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolPageLayout title="SQL Formatter" description="Beautify and format SQL queries">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">SQL Query</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="SELECT * FROM users WHERE id = 1 AND name = 'test'" className="input-dark w-full h-40 font-mono text-sm resize-none" />
        <button onClick={format} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
          Format SQL
        </button>
      </div>
      {output && (
        <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Formatted SQL</label>
            <button onClick={copyOutput} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto">{output}</pre>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default SqlFormatterPage;
