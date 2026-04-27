import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check, ShieldCheck, ShieldAlert } from "lucide-react";

function b64urlDecode(s: string): string {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function b64urlEncodeBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(alg: "SHA-256" | "SHA-384" | "SHA-512", secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: alg }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

const SAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const JwtDebuggerPage = () => {
  const [token, setToken] = useState(SAMPLE);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [verifyState, setVerifyState] = useState<"idle" | "valid" | "invalid" | "unsupported">("idle");
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT format (expected 3 parts)");
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      return { header, payload, signature: parts[2], parts };
    } catch (e: any) {
      return { error: e.message || "Invalid JWT" } as const;
    }
  }, [token]);

  useEffect(() => {
    setVerifyState("idle");
    if (!decoded || "error" in decoded) return;
    const alg = decoded.header.alg as string | undefined;
    const map: Record<string, "SHA-256" | "SHA-384" | "SHA-512"> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
    if (!alg || !map[alg]) { setVerifyState("unsupported"); return; }
    if (!secret) return;
    let cancelled = false;
    (async () => {
      try {
        const sig = await hmacSign(map[alg], secret, `${decoded.parts[0]}.${decoded.parts[1]}`);
        const expected = b64urlEncodeBytes(sig);
        if (!cancelled) setVerifyState(expected === decoded.signature ? "valid" : "invalid");
      } catch { if (!cancelled) setVerifyState("invalid"); }
    })();
    return () => { cancelled = true; };
  }, [decoded, secret]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const ok = decoded && !("error" in decoded);
  const exp = ok ? decoded.payload.exp : undefined;
  const iat = ok ? decoded.payload.iat : undefined;
  const nbf = ok ? decoded.payload.nbf : undefined;
  const expired = typeof exp === "number" && exp * 1000 < Date.now();

  return (
    <ToolPageLayout title="JWT Debugger" description="Decode, inspect, and verify JSON Web Tokens (HS256/384/512)">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Encoded Token</label>
          <button onClick={() => copy(token)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <textarea value={token} onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="input-dark w-full h-32 font-mono text-xs resize-none break-all" />
      </div>

      {decoded && "error" in decoded && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive">{decoded.error}</p>
        </div>
      )}

      {ok && (
        <>
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-primary mb-3">Header</h3>
              <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto">{JSON.stringify(decoded.header, null, 2)}</pre>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-primary mb-3">Payload</h3>
              <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto">{JSON.stringify(decoded.payload, null, 2)}</pre>
              <div className="mt-3 space-y-1 text-xs">
                {iat && <p className="text-muted-foreground">Issued: {new Date(iat * 1000).toLocaleString()}</p>}
                {nbf && <p className="text-muted-foreground">Not before: {new Date(nbf * 1000).toLocaleString()}</p>}
                {exp && (
                  <p className={expired ? "text-destructive" : "text-success"}>
                    Expires: {new Date(exp * 1000).toLocaleString()} {expired ? "(expired)" : "(valid)"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">Signature Verification</h3>
              {verifyState === "valid" && <span className="inline-flex items-center gap-1.5 text-xs text-success"><ShieldCheck className="w-3.5 h-3.5" /> Signature valid</span>}
              {verifyState === "invalid" && <span className="inline-flex items-center gap-1.5 text-xs text-destructive"><ShieldAlert className="w-3.5 h-3.5" /> Signature invalid</span>}
              {verifyState === "unsupported" && <span className="text-xs text-muted-foreground">Algorithm not supported (HS only)</span>}
            </div>
            <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="HMAC secret"
              className="input-dark w-full font-mono text-sm" />
            <p className="text-xs text-muted-foreground font-mono break-all">sig: {decoded.signature}</p>
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default JwtDebuggerPage;
