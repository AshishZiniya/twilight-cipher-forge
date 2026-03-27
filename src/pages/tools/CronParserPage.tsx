import { useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";

const FIELDS = ["Minute", "Hour", "Day (Month)", "Month", "Day (Week)"];
const RANGES = ["0-59", "0-23", "1-31", "1-12", "0-6 (Sun-Sat)"];

function describeCronField(value: string, field: string): string {
  if (value === "*") return `every ${field.toLowerCase()}`;
  if (value.includes("/")) {
    const [, step] = value.split("/");
    return `every ${step} ${field.toLowerCase()}(s)`;
  }
  if (value.includes(",")) return `at ${field.toLowerCase()} ${value}`;
  if (value.includes("-")) return `from ${value} ${field.toLowerCase()}`;
  return `at ${field.toLowerCase()} ${value}`;
}

function parseCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (expected 5 fields)";
  return parts.map((p, i) => describeCronField(p, FIELDS[i])).join(", ");
}

const CronParserPage = () => {
  const [cron, setCron] = useState("*/5 * * * *");
  const description = parseCron(cron);

  return (
    <ToolPageLayout title="Cron Expression Parser" description="Parse and understand cron expressions">
      <div className="glass rounded-xl p-6 space-y-4">
        <label className="text-sm font-medium text-foreground">Cron Expression</label>
        <input
          type="text"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="*/5 * * * *"
          className="input-dark w-full font-mono text-lg"
        />
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
              <p className="font-mono text-lg text-foreground mt-1">{cron.trim().split(/\s+/)[i] || "*"}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default CronParserPage;
