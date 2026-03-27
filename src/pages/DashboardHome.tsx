import { Link } from "react-router-dom";
import { Globe, Hash, Key, Braces, Code2, Palette, Clock, FileCode, TestTube, ArrowRight } from "lucide-react";

const tools = [
  { name: "URL Encoder", desc: "Encode & decode URLs", icon: Globe, path: "/dashboard/url-encoder", color: "text-info" },
  { name: "Hash Generator", desc: "Generate cryptographic hashes", icon: Hash, path: "/dashboard/hash-generator", color: "text-success" },
  { name: "JWT Debugger", desc: "Decode JWT tokens", icon: Key, path: "/dashboard/jwt-debugger", color: "text-warning" },
  { name: "JSON Formatter", desc: "Format & validate JSON", icon: Braces, path: "/dashboard/json-formatter", color: "text-primary" },
  { name: "Base64 Codec", desc: "Base64 encode/decode", icon: Code2, path: "/dashboard/base64", color: "text-info" },
  { name: "Color Converter", desc: "HEX, RGB, HSL convert", icon: Palette, path: "/dashboard/color-converter", color: "text-destructive" },
  { name: "Cron Parser", desc: "Parse cron expressions", icon: Clock, path: "/dashboard/cron-parser", color: "text-warning" },
  { name: "Diff Checker", desc: "Compare text differences", icon: FileCode, path: "/dashboard/diff-checker", color: "text-success" },
  { name: "SQL Formatter", desc: "Beautify SQL queries", icon: FileCode, path: "/dashboard/sql-formatter", color: "text-primary" },
  { name: "API Tester", desc: "Test REST API endpoints", icon: TestTube, path: "/dashboard/api-tester", color: "text-info" },
];

const DashboardHome = () => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Welcome back 👋</h1>
        <p className="mt-2 text-muted-foreground">Choose a tool to get started</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.path} to={tool.path} className="tool-card group flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <tool.icon className={`w-5 h-5 ${tool.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
