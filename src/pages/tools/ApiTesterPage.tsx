import { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import {
  Send,
  Loader2,
  Plus,
  Trash2,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

interface KV {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface ResponseData {
  status: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
  time: number;
  size: number;
  contentType: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const emptyKV = (): KV => ({ id: uid(), key: "", value: "", enabled: true });

// --------- cURL parser ----------
// Tokenize a curl command honoring single / double quotes and backslash continuations.
function tokenizeCurl(input: string): string[] {
  const s = input.replace(/\\\r?\n/g, " ").trim();
  const tokens: string[] = [];
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    const ch = s[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      let buf = "";
      while (i < s.length && s[i] !== quote) {
        if (s[i] === "\\" && i + 1 < s.length && (s[i + 1] === quote || s[i + 1] === "\\")) {
          buf += s[i + 1];
          i += 2;
        } else {
          buf += s[i++];
        }
      }
      i++; // skip closing quote
      tokens.push(buf);
    } else {
      let buf = "";
      while (i < s.length && !/\s/.test(s[i])) buf += s[i++];
      tokens.push(buf);
    }
  }
  return tokens;
}

interface ParsedCurl {
  url: string;
  method: Method;
  headers: KV[];
  params: KV[];
  body: string;
  bodyType: "none" | "json" | "form" | "text";
}

function parseCurl(input: string): ParsedCurl | null {
  const trimmed = input.trim();
  if (!/^curl(\s|$)/i.test(trimmed)) return null;
  const tokens = tokenizeCurl(trimmed).slice(1); // drop leading "curl"

  let url = "";
  let method: Method = "GET";
  const headers: KV[] = [];
  const dataParts: string[] = [];
  const formParts: string[] = [];
  let bodyType: ParsedCurl["bodyType"] = "none";

  const eat = (i: number) => tokens[i + 1];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-X" || t === "--request") {
      const v = eat(i)?.toUpperCase() as Method;
      if (v && METHODS.includes(v)) method = v;
      i++;
    } else if (t === "-H" || t === "--header") {
      const v = eat(i);
      i++;
      if (!v) continue;
      const idx = v.indexOf(":");
      if (idx > 0) {
        headers.push({
          id: uid(),
          key: v.slice(0, idx).trim(),
          value: v.slice(idx + 1).trim(),
          enabled: true,
        });
      }
    } else if (
      t === "-d" ||
      t === "--data" ||
      t === "--data-raw" ||
      t === "--data-binary" ||
      t === "--data-ascii"
    ) {
      const v = eat(i);
      i++;
      if (v != null) dataParts.push(v);
    } else if (t === "--data-urlencode") {
      const v = eat(i);
      i++;
      if (v != null) dataParts.push(v);
      bodyType = "form";
    } else if (t === "-F" || t === "--form") {
      const v = eat(i);
      i++;
      if (v != null) formParts.push(v);
      bodyType = "form";
    } else if (t === "-u" || t === "--user") {
      const v = eat(i);
      i++;
      if (v) {
        try {
          const encoded = btoa(v);
          headers.push({
            id: uid(),
            key: "Authorization",
            value: `Basic ${encoded}`,
            enabled: true,
          });
        } catch {
          /* ignore */
        }
      }
    } else if (t === "-A" || t === "--user-agent") {
      const v = eat(i);
      i++;
      if (v) headers.push({ id: uid(), key: "User-Agent", value: v, enabled: true });
    } else if (t === "-e" || t === "--referer") {
      const v = eat(i);
      i++;
      if (v) headers.push({ id: uid(), key: "Referer", value: v, enabled: true });
    } else if (t === "-b" || t === "--cookie") {
      const v = eat(i);
      i++;
      if (v) headers.push({ id: uid(), key: "Cookie", value: v, enabled: true });
    } else if (
      t === "--compressed" ||
      t === "-L" ||
      t === "--location" ||
      t === "-k" ||
      t === "--insecure" ||
      t === "-s" ||
      t === "--silent" ||
      t === "-v" ||
      t === "--verbose" ||
      t === "-i" ||
      t === "--include" ||
      t === "-I" ||
      t === "--head" ||
      t === "-g" ||
      t === "--globoff"
    ) {
      // ignore flags without args
    } else if (t === "-o" || t === "--output" || t === "-T" || t === "--upload-file") {
      i++; // skip arg
    } else if (t.startsWith("--") && eat(i) && !eat(i)!.startsWith("-")) {
      // unknown long flag with arg — skip its arg conservatively only for known patterns
      // Don't consume: leave as-is
    } else if (!t.startsWith("-")) {
      // positional → URL (last one wins)
      if (!url) url = t;
    }
  }

  // Strip url:// prefix if user pasted "url 'https://...'" pattern? handled by tokenizer.

  // Body assembly
  let body = "";
  if (formParts.length > 0) {
    body = formParts.join("&");
    bodyType = "form";
  } else if (dataParts.length > 0) {
    body = dataParts.join("&");
    // detect json
    const trimmedBody = body.trim();
    if (
      (trimmedBody.startsWith("{") && trimmedBody.endsWith("}")) ||
      (trimmedBody.startsWith("[") && trimmedBody.endsWith("]"))
    ) {
      try {
        body = JSON.stringify(JSON.parse(trimmedBody), null, 2);
        bodyType = "json";
      } catch {
        bodyType = bodyType === "form" ? "form" : "text";
      }
    } else if (bodyType === "none") {
      bodyType = "text";
    }
  }

  // If body present and method is still GET, default to POST
  if (body && method === "GET") method = "POST";

  // Split url & query params
  const params: KV[] = [];
  let cleanUrl = url;
  try {
    const u = new URL(url);
    u.searchParams.forEach((value, key) => {
      params.push({ id: uid(), key, value, enabled: true });
    });
    u.search = "";
    cleanUrl = u.toString().replace(/\?$/, "");
  } catch {
    // not a valid URL — keep raw
  }

  return { url: cleanUrl, method, headers, params, body, bodyType };
}

// --------- Helpers ----------
function buildUrl(base: string, params: KV[]): string {
  const enabled = params.filter((p) => p.enabled && p.key.trim());
  if (enabled.length === 0) return base;
  const qs = enabled
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
  return base + (base.includes("?") ? "&" : "?") + qs;
}

function kvToRecord(kvs: KV[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const kv of kvs) {
    if (!kv.enabled) continue;
    const k = kv.key.trim();
    if (!k) continue;
    out[k] = kv.value;
  }
  return out;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 300 && status < 400) return "text-info";
  if (status >= 400 && status < 500) return "text-warning";
  return "text-destructive";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// --------- Component ----------
type Tab = "params" | "headers" | "body" | "auth";
type ResponseTab = "body" | "headers";
type BodyType = "none" | "json" | "form" | "text";

const ApiTesterPage = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<Method>("GET");
  const [params, setParams] = useState<KV[]>([emptyKV()]);
  const [headers, setHeaders] = useState<KV[]>([
    { id: uid(), key: "Content-Type", value: "application/json", enabled: true },
    emptyKV(),
  ]);
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState<BodyType>("json");
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic">("none");
  const [bearerToken, setBearerToken] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");
  const [tab, setTab] = useState<Tab>("params");
  const [responseTab, setResponseTab] = useState<ResponseTab>("body");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importBanner, setImportBanner] = useState("");
  const [copied, setCopied] = useState(false);

  // --- KV editors ---
  const updateKVList = (
    setter: React.Dispatch<React.SetStateAction<KV[]>>
  ) => ({
    update: (id: string, patch: Partial<KV>) =>
      setter((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
        // auto-add a blank trailing row if user starts editing the last one
        const last = next[next.length - 1];
        if (last && (last.key.trim() || last.value.trim())) next.push(emptyKV());
        return next;
      }),
    remove: (id: string) =>
      setter((prev) => {
        const next = prev.filter((p) => p.id !== id);
        return next.length === 0 ? [emptyKV()] : next;
      }),
    add: () => setter((prev) => [...prev, emptyKV()]),
  });

  const paramOps = updateKVList(setParams);
  const headerOps = updateKVList(setHeaders);

  // --- cURL import ---
  const tryImportCurl = (text: string): boolean => {
    const parsed = parseCurl(text);
    if (!parsed) return false;
    setUrl(parsed.url);
    setMethod(parsed.method);
    setParams(parsed.params.length ? [...parsed.params, emptyKV()] : [emptyKV()]);
    setHeaders(parsed.headers.length ? [...parsed.headers, emptyKV()] : [emptyKV()]);
    setBody(parsed.body);
    setBodyType(parsed.bodyType === "none" ? "json" : parsed.bodyType);
    if (parsed.body && parsed.method === "GET") {
      // parser already promotes to POST
    }
    setTab(parsed.body ? "body" : parsed.headers.length ? "headers" : "params");
    setImportBanner(
      `Imported cURL → ${parsed.method} • ${parsed.headers.length} header${
        parsed.headers.length === 1 ? "" : "s"
      } • ${parsed.params.length} param${parsed.params.length === 1 ? "" : "s"}${
        parsed.body ? " • body" : ""
      }`
    );
    setTimeout(() => setImportBanner(""), 3500);
    return true;
  };

  const handleUrlChange = (v: string) => {
    if (/^\s*curl\s/i.test(v)) {
      const ok = tryImportCurl(v);
      if (ok) return;
    }
    setUrl(v);
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/^\s*curl\s/i.test(text)) {
      e.preventDefault();
      tryImportCurl(text);
    }
  };

  // --- Send ---
  const send = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    setLoading(true);
    setError("");
    setResponse(null);

    const finalUrl = buildUrl(url.trim(), params);
    const reqHeaders = kvToRecord(headers);

    if (authType === "bearer" && bearerToken.trim()) {
      reqHeaders["Authorization"] = `Bearer ${bearerToken.trim()}`;
    } else if (authType === "basic" && (basicUser || basicPass)) {
      try {
        reqHeaders["Authorization"] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
      } catch {
        /* ignore */
      }
    }

    const init: RequestInit = { method, headers: reqHeaders };
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      init.body = body;
    }

    const start = performance.now();
    try {
      const res = await fetch(finalUrl, init);
      const text = await res.text();
      const time = Math.round(performance.now() - start);

      const respHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        respHeaders[k] = v;
      });

      const contentType = res.headers.get("content-type") || "";
      let formatted = text;
      if (contentType.includes("json")) {
        try {
          formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          /* ignore */
        }
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: formatted,
        headers: respHeaders,
        time,
        size: new Blob([text]).size,
        contentType,
      });
      setResponseTab("body");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(
        msg.includes("Failed to fetch")
          ? "Request failed. The server may not allow CORS, or the URL is unreachable from the browser."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Generate cURL of current request ---
  const generatedCurl = useMemo(() => {
    const finalUrl = buildUrl(url.trim() || "https://api.example.com", params);
    const parts: string[] = [`curl -X ${method} '${finalUrl}'`];
    const hdr = kvToRecord(headers);
    if (authType === "bearer" && bearerToken.trim()) {
      hdr["Authorization"] = `Bearer ${bearerToken.trim()}`;
    } else if (authType === "basic" && (basicUser || basicPass)) {
      try {
        hdr["Authorization"] = `Basic ${btoa(`${basicUser}:${basicPass}`)}`;
      } catch {
        /* ignore */
      }
    }
    for (const [k, v] of Object.entries(hdr)) {
      parts.push(`  -H '${k}: ${v.replace(/'/g, "'\\''")}'`);
    }
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      parts.push(`  --data '${body.replace(/'/g, "'\\''")}'`);
    }
    return parts.join(" \\\n");
  }, [url, params, method, headers, body, authType, bearerToken, basicUser, basicPass]);

  const copyCurl = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const importPrompt = () => {
    const text = window.prompt(
      "Paste a cURL command — fields will be auto-filled from it."
    );
    if (text) tryImportCurl(text);
  };

  const enabledParamCount = params.filter((p) => p.enabled && p.key.trim()).length;
  const enabledHeaderCount = headers.filter((h) => h.enabled && h.key.trim()).length;
  const hasBody = body.trim().length > 0;

  const KVRow = ({
    kv,
    onUpdate,
    onRemove,
    keyPlaceholder,
    valuePlaceholder,
  }: {
    kv: KV;
    onUpdate: (id: string, patch: Partial<KV>) => void;
    onRemove: (id: string) => void;
    keyPlaceholder: string;
    valuePlaceholder: string;
  }) => (
    <div className="flex items-center gap-2 group">
      <input
        type="checkbox"
        checked={kv.enabled}
        onChange={(e) => onUpdate(kv.id, { enabled: e.target.checked })}
        className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer"
      />
      <input
        value={kv.key}
        onChange={(e) => onUpdate(kv.id, { key: e.target.value })}
        placeholder={keyPlaceholder}
        className="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
      />
      <input
        value={kv.value}
        onChange={(e) => onUpdate(kv.id, { value: e.target.value })}
        placeholder={valuePlaceholder}
        className="flex-[2] bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
      />
      <button
        onClick={() => onRemove(kv.id)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
        title="Remove"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const TabButton = ({
    id,
    label,
    badge,
  }: {
    id: Tab;
    label: string;
    badge?: number | string;
  }) => (
    <button
      onClick={() => setTab(id)}
      className={`relative px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
        tab === id
          ? "text-foreground border-primary"
          : "text-muted-foreground border-transparent hover:text-foreground"
      }`}
    >
      {label}
      {badge !== undefined && badge !== 0 && badge !== "" && (
        <span
          className={`ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold ${
            tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <ToolPageLayout
      title="API Tester"
      description="Send HTTP requests, paste cURL to auto-fill, and inspect responses"
    >
      {/* Top bar: method + url + send + import */}
      <div className="glass rounded-xl p-3">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className="bg-surface border border-border rounded-md px-3 py-2 font-mono text-sm font-bold text-primary focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all w-28"
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="bg-background text-foreground">
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onPaste={handleUrlPaste}
            placeholder="https://api.example.com/data — or paste a cURL command"
            className="flex-1 bg-surface border border-border rounded-md px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={importPrompt}
            title="Import cURL"
            className="px-3 py-2 bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button
            onClick={send}
            disabled={loading || !url.trim()}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </div>

        {importBanner && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            {importBanner}
          </div>
        )}
      </div>

      {/* Request tabs */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 px-3 border-b border-border">
          <TabButton id="params" label="Params" badge={enabledParamCount} />
          <TabButton id="headers" label="Headers" badge={enabledHeaderCount} />
          <TabButton id="body" label="Body" badge={hasBody ? "•" : ""} />
          <TabButton id="auth" label="Auth" badge={authType !== "none" ? "•" : ""} />
        </div>

        <div className="p-4">
          {tab === "params" && (
            <div className="space-y-2">
              <div className="flex items-center text-[10px] uppercase tracking-wide text-muted-foreground font-semibold pl-6">
                <span className="flex-1">Key</span>
                <span className="flex-[2]">Value</span>
                <span className="w-7" />
              </div>
              {params.map((p) => (
                <KVRow
                  key={p.id}
                  kv={p}
                  onUpdate={paramOps.update}
                  onRemove={paramOps.remove}
                  keyPlaceholder="param"
                  valuePlaceholder="value"
                />
              ))}
              <button
                onClick={paramOps.add}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" />
                Add param
              </button>
            </div>
          )}

          {tab === "headers" && (
            <div className="space-y-2">
              <div className="flex items-center text-[10px] uppercase tracking-wide text-muted-foreground font-semibold pl-6">
                <span className="flex-1">Header</span>
                <span className="flex-[2]">Value</span>
                <span className="w-7" />
              </div>
              {headers.map((h) => (
                <KVRow
                  key={h.id}
                  kv={h}
                  onUpdate={headerOps.update}
                  onRemove={headerOps.remove}
                  keyPlaceholder="Content-Type"
                  valuePlaceholder="application/json"
                />
              ))}
              <button
                onClick={headerOps.add}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" />
                Add header
              </button>
            </div>
          )}

          {tab === "body" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {(["none", "json", "form", "text"] as BodyType[]).map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setBodyType(bt)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      bodyType === bt
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-surface text-muted-foreground border border-border hover:text-foreground"
                    }`}
                  >
                    {bt === "none"
                      ? "None"
                      : bt === "json"
                      ? "JSON"
                      : bt === "form"
                      ? "Form (x-www-form-urlencoded)"
                      : "Raw text"}
                  </button>
                ))}
                {body && (
                  <button
                    onClick={() => {
                      try {
                        setBody(JSON.stringify(JSON.parse(body), null, 2));
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Format JSON
                  </button>
                )}
              </div>
              {bodyType === "none" ? (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  This request does not have a body.
                </p>
              ) : (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={
                    bodyType === "json"
                      ? '{\n  "key": "value"\n}'
                      : bodyType === "form"
                      ? "key1=value1&key2=value2"
                      : "raw payload"
                  }
                  className="w-full h-48 bg-surface border border-border rounded-md p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 resize-y transition-all"
                />
              )}
            </div>
          )}

          {tab === "auth" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {(["none", "bearer", "basic"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAuthType(a)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      authType === a
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-surface text-muted-foreground border border-border hover:text-foreground"
                    }`}
                  >
                    {a === "none" ? "No Auth" : a === "bearer" ? "Bearer Token" : "Basic Auth"}
                  </button>
                ))}
              </div>
              {authType === "bearer" && (
                <div>
                  <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                    Token
                  </label>
                  <input
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              )}
              {authType === "basic" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                      Username
                    </label>
                    <input
                      value={basicUser}
                      onChange={(e) => setBasicUser(e.target.value)}
                      className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                      Password
                    </label>
                    <input
                      type="password"
                      value={basicPass}
                      onChange={(e) => setBasicPass(e.target.value)}
                      className="mt-1 w-full bg-surface border border-border rounded-md px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>
              )}
              {authType === "none" && (
                <p className="text-xs text-muted-foreground py-2">
                  No auth header will be sent.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code (cURL) */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">cURL</span>
            <span className="text-[10px] text-muted-foreground">
              equivalent of this request
            </span>
          </div>
          <button
            onClick={copyCurl}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="bg-surface/60 p-4 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-48">
          {generatedCurl}
        </pre>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 border-destructive/30 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="glass rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface/40">
            <div className="flex items-baseline gap-2">
              <span className={`font-mono font-bold text-base ${statusColor(response.status)}`}>
                {response.status}
              </span>
              <span className="text-xs text-muted-foreground">{response.statusText}</span>
            </div>
            <div className="ml-auto flex items-center gap-4 text-[11px]">
              <span className="text-muted-foreground">
                Time: <span className="text-foreground font-mono font-medium">{response.time} ms</span>
              </span>
              <span className="text-muted-foreground">
                Size:{" "}
                <span className="text-foreground font-mono font-medium">
                  {formatSize(response.size)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 border-b border-border">
            <button
              onClick={() => setResponseTab("body")}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                responseTab === "body"
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Body
            </button>
            <button
              onClick={() => setResponseTab("headers")}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                responseTab === "headers"
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Headers
              <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold bg-muted text-muted-foreground">
                {Object.keys(response.headers).length}
              </span>
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(response.body)}
              className="ml-auto text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>

          {responseTab === "body" ? (
            <pre className="bg-surface/40 p-4 text-xs font-mono text-foreground overflow-auto max-h-[28rem] whitespace-pre-wrap break-words">
              {response.body || <span className="text-muted-foreground">(empty)</span>}
            </pre>
          ) : (
            <div className="divide-y divide-border max-h-[28rem] overflow-auto">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[200px_1fr] gap-3 px-4 py-2 text-xs">
                  <span className="font-mono font-semibold text-foreground truncate">{k}</span>
                  <span className="font-mono text-muted-foreground break-all">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default ApiTesterPage;
