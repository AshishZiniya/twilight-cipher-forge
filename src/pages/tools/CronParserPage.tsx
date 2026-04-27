import { useMemo, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";

const FIELDS = ["Minute", "Hour", "Day (Month)", "Month", "Day (Week)"];
const RANGES = ["0-59", "0-23", "1-31", "1-12", "0-6 (Sun-Sat)"];
const BOUNDS: [number, number][] = [[0,59],[0,23],[1,31],[1,12],[0,6]];
const ALIASES: Record<string, string> = {
  "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *", "@midnight": "0 0 * * *", "@hourly": "0 * * * *",
};
const PRESETS = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 min", expr: "*/5 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Daily 9am", expr: "0 9 * * *" },
  { label: "Weekdays 9am", expr: "0 9 * * 1-5" },
  { label: "Sunday midnight", expr: "0 0 * * 0" },
];
const MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function expandField(value: string, idx: number): Set<number> | "invalid" {
  const [min, max] = BOUNDS[idx];
  const out = new Set<number>();
  for (const part of value.split(",")) {
    let step = 1; let body = part;
    if (part.includes("/")) { const [b, s] = part.split("/"); body = b; step = parseInt(s, 10); if (!step) return "invalid"; }
    let lo = min, hi = max;
    if (body !== "*") {
      if (body.includes("-")) { const [a, b] = body.split("-").map(Number); lo = a; hi = b; }
      else { const n = parseInt(body, 10); if (Number.isNaN(n)) return "invalid"; lo = hi = n; }
    }
    if (lo < min || hi > max || lo > hi) return "invalid";
    for (let n = lo; n <= hi; n += step) out.add(n);
  }
  return out;
}

function describe(parts: string[]): string {
  if (parts.length !== 5) return "Invalid cron expression (expected 5 fields)";
  const [m, h, dom, mon, dow] = parts;
  const bits: string[] = [];
  // time
  if (m === "*" && h === "*") bits.push("Every minute");
  else if (m.startsWith("*/") && h === "*") bits.push(`Every ${m.slice(2)} minutes`);
  else if (h === "*" && /^\d+$/.test(m)) bits.push(`At minute ${m} of every hour`);
  else if (/^\d+$/.test(m) && /^\d+$/.test(h)) bits.push(`At ${h.padStart(2, "0")}:${m.padStart(2, "0")}`);
  else bits.push(`At minute ${m} past hour ${h}`);
  // day
  if (dom !== "*") bits.push(`on day-of-month ${dom}`);
  if (mon !== "*") {
    const set = expandField(mon, 3);
    if (set !== "invalid") bits.push(`in ${[...set].map((n) => MONTH[n - 1]).join(", ")}`);
  }
  if (dow !== "*") {
    const set = expandField(dow, 4);
    if (set !== "invalid") bits.push(`on ${[...set].map((n) => DOW[n]).join(", ")}`);
  }
  return bits.join(" ");
}

function nextRuns(parts: string[], count = 5, from = new Date()): Date[] {
  if (parts.length !== 5) return [];
  const sets = parts.map((p, i) => expandField(p, i));
  if (sets.some((s) => s === "invalid")) return [];
  const [mins, hrs, doms, mons, dows] = sets as Set<number>[];
  const out: Date[] = [];
  const d = new Date(from.getTime() + 60_000); // start at next minute
  d.setSeconds(0, 0);
  // limit search ~ 4 years
  const limit = 4 * 366 * 24 * 60;
  let i = 0;
  while (out.length < count && i < limit) {
    if (mins.has(d.getMinutes()) && hrs.has(d.getHours()) && mons.has(d.getMonth() + 1)) {
      const domOk = doms.has(d.getDate());
      const dowOk = dows.has(d.getDay());
      // standard cron: if both restricted, OR; if one is *, AND
      const domStar = parts[2] === "*";
      const dowStar = parts[4] === "*";
      const matches = (domStar && dowStar) || (domStar ? dowOk : dowStar ? domOk : (domOk || dowOk));
      if (matches) out.push(new Date(d));
    }
    d.setMinutes(d.getMinutes() + 1);
    i++;
  }
  return out;
}

const CronParserPage = () => {
  const [cron, setCron] = useState("*/5 * * * *");

  const expr = ALIASES[cron.trim().toLowerCase()] || cron.trim();
  const parts = expr.split(/\s+/);
  const description = useMemo(() => describe(parts), [expr]);
  const upcoming = useMemo(() => nextRuns(parts), [expr]);

  return (
    <ToolPageLayout title="Cron Expression Parser" description="Parse, describe, and forecast cron schedules">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">Cron Expression</label>
        <input type="text" value={cron} onChange={(e) => setCron(e.target.value)} placeholder="*/5 * * * *  or  @daily"
          className="input-dark w-full font-mono text-lg" />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.expr} onClick={() => setCron(p.expr)} className="px-3 py-1 text-xs rounded-md bg-surface hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border">
              {p.label}
            </button>
          ))}
        </div>
        <div className="bg-surface rounded-lg p-4">
          <span className="text-xs font-semibold text-primary">Description</span>
          <p className="text-sm text-foreground mt-1">{description}</p>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Field Reference</h3>
        <div className="grid grid-cols-5 gap-3">
          {FIELDS.map((f, i) => (
            <div key={f} className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-primary">{f}</p>
              <p className="text-xs text-muted-foreground mt-1">{RANGES[i]}</p>
              <p className="font-mono text-lg text-foreground mt-1">{parts[i] || "*"}</p>
            </div>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-3">Next 5 runs</h3>
          <ul className="space-y-1.5">
            {upcoming.map((d, i) => (
              <li key={i} className="font-mono text-sm text-foreground bg-surface rounded-md px-3 py-2">
                {d.toLocaleString(undefined, { weekday: "short", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default CronParserPage;
