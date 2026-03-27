import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check } from "lucide-react";

async function computeHash(algorithm: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const algorithms = [
  { name: "SHA-1", algo: "SHA-1" },
  { name: "SHA-256", algo: "SHA-256" },
  { name: "SHA-384", algo: "SHA-384" },
  { name: "SHA-512", algo: "SHA-512" },
];

const HashGeneratorPage = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ name: string; hash: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = async () => {
    if (!input) return;
    const hashes = await Promise.all(
      algorithms.map(async (a) => ({ name: a.name, hash: await computeHash(a.algo, input) }))
    );
    setResults(hashes);
  };

  const copy = (hash: string, idx: number) => {
    navigator.clipboard.writeText(hash);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <ToolPageLayout title="Hash Generator" description="Generate cryptographic hashes from text using SHA algorithms">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="input-dark w-full h-32 font-mono text-sm resize-none"
        />
        <button onClick={generate} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
          Generate Hashes
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {results.map((r, i) => (
            <div key={r.name} className="glass rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-primary">{r.name}</span>
                <p className="mt-1 font-mono text-xs text-foreground break-all">{r.hash}</p>
              </div>
              <button onClick={() => copy(r.hash, i)} className="flex-shrink-0 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                {copiedIdx === i ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default HashGeneratorPage;
