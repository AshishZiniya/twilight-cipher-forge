import { useEffect, useRef, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check, Upload, Eraser } from "lucide-react";

// Pure-JS MD5 (RFC 1321)
function md5(input: string): string {
  function rh(n: number) {
    let s = "", j = 0;
    for (; j <= 3; j++) s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
    return s;
  }
  function ad(x: number, y: number) { const l = (x & 0xffff) + (y & 0xffff); const m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xffff); }
  function rl(n: number, c: number) { return (n << c) | (n >>> (32 - c)); }
  function cm(q: number, a: number, b: number, x: number, s: number, t: number) { return ad(rl(ad(ad(a, q), ad(x, t)), s), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm(c ^ (b | ~d), a, b, x, s, t); }
  function cb(s: string) {
    const utf8 = unescape(encodeURIComponent(s));
    const nb = ((utf8.length + 8) >> 6) + 1; const bl = nb * 16;
    const b = new Array(bl).fill(0);
    for (let i = 0; i < utf8.length; i++) b[i >> 2] |= utf8.charCodeAt(i) << ((i % 4) * 8);
    b[utf8.length >> 2] |= 0x80 << ((utf8.length % 4) * 8);
    b[bl - 2] = utf8.length * 8;
    return b;
  }
  const x = cb(input);
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[i + 0], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426); c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632); c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784); c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i + 0], 11, -358537222); c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i + 0], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606); c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = ad(a, oa); b = ad(b, ob); c = ad(c, oc); d = ad(d, od);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
}

async function subtleHash(algo: string, data: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

const HashGeneratorPage = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ name: string; hash: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [compare, setCompare] = useState("");
  const [source, setSource] = useState<"text" | "file">("text");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // live recompute for text
  useEffect(() => {
    if (source !== "text") return;
    if (!input) { setResults([]); return; }
    let cancelled = false;
    (async () => {
      const data = new TextEncoder().encode(input).buffer;
      const out: { name: string; hash: string }[] = [{ name: "MD5", hash: md5(input) }];
      for (const a of ALGOS.slice(1)) out.push({ name: a, hash: await subtleHash(a, data) });
      if (!cancelled) setResults(out);
    })();
    return () => { cancelled = true; };
  }, [input, source]);

  const onFile = async (file: File) => {
    setSource("file");
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    // MD5 needs string; convert binary to latin1
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const out: { name: string; hash: string }[] = [{ name: "MD5", hash: md5(bin) }];
    for (const a of ALGOS.slice(1)) out.push({ name: a, hash: await subtleHash(a, buf) });
    setResults(out);
  };

  const copy = (h: string, i: number) => {
    navigator.clipboard.writeText(h);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const cmpNorm = compare.trim().toLowerCase();

  return (
    <ToolPageLayout title="Hash Generator" description="MD5, SHA-1, SHA-256/384/512 of text or files — computed live in your browser">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(["text", "file"] as const).map((s) => (
              <button key={s} onClick={() => { setSource(s); setResults([]); setInput(""); setFileName(""); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  source === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{s}</button>
            ))}
          </div>
          {source === "file" && (
            <>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity">
                <Upload className="w-3.5 h-3.5" /> Choose file
              </button>
              {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
            </>
          )}
          <button onClick={() => { setInput(""); setResults([]); setFileName(""); }} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Eraser className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {source === "text" && (
          <div>
            <label className="text-sm font-medium text-foreground">Input Text</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type to hash live…"
              className="input-dark w-full h-32 font-mono text-sm resize-none mt-2" />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground">Compare with hash</label>
          <input type="text" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Paste a known hash to verify…"
            className="input-dark w-full font-mono text-xs mt-2" />
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {results.map((r, i) => {
            const match = cmpNorm && cmpNorm === r.hash.toLowerCase();
            return (
              <div key={r.name} className={`glass rounded-xl p-4 flex items-start justify-between gap-4 ${match ? "border-success/40" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{r.name}</span>
                    {match && <span className="text-[10px] uppercase tracking-wide text-success">match</span>}
                  </div>
                  <p className="mt-1 font-mono text-xs text-foreground break-all">{r.hash}</p>
                </div>
                <button onClick={() => copy(r.hash, i)} className="flex-shrink-0 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  {copiedIdx === i ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default HashGeneratorPage;
