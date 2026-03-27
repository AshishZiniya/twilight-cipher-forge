import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";

function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { header, payload, signature: parts[2] };
  } catch (e: any) {
    return { error: e.message || "Invalid JWT" };
  }
}

const JwtDebuggerPage = () => {
  const [token, setToken] = useState("");
  const decoded = token ? decodeJWT(token) : null;

  return (
    <ToolPageLayout title="JWT Debugger" description="Decode and inspect JSON Web Tokens">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">Paste JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="input-dark w-full h-32 font-mono text-sm resize-none"
        />
      </div>
      {decoded && !("error" in decoded) && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-primary mb-3">Header</h3>
            <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-primary mb-3">Payload</h3>
            <pre className="bg-surface rounded-lg p-4 text-sm font-mono text-foreground overflow-auto">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
            {decoded.payload.exp && (
              <p className="mt-3 text-xs text-muted-foreground">
                Expires: {new Date(decoded.payload.exp * 1000).toLocaleString()}
                {decoded.payload.exp * 1000 < Date.now() ? " (expired)" : " (valid)"}
              </p>
            )}
          </div>
        </div>
      )}
      {decoded && "error" in decoded && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <p className="text-sm text-destructive">{decoded.error}</p>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default JwtDebuggerPage;
