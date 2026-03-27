import { Link } from "react-router-dom";
import { Code2, ArrowRight, Globe, Hash, Key, Braces, Palette, Clock, FileCode, TestTube, Moon, Sun, Zap, Shield, Terminal } from "lucide-react";
import { toggleTheme, isDarkMode } from "@/hooks/use-theme";
import { useState } from "react";

const tools = [
  { name: "URL Encoder", desc: "Encode & decode URLs instantly", icon: Globe, path: "/dashboard/url-encoder" },
  { name: "Hash Generator", desc: "MD5, SHA-1, SHA-256 hashing", icon: Hash, path: "/dashboard/hash-generator" },
  { name: "JWT Debugger", desc: "Decode & inspect JWT tokens", icon: Key, path: "/dashboard/jwt-debugger" },
  { name: "JSON Formatter", desc: "Beautify & validate JSON", icon: Braces, path: "/dashboard/json-formatter" },
  { name: "Color Converter", desc: "HEX, RGB, HSL conversion", icon: Palette, path: "/dashboard/color-converter" },
  { name: "API Tester", desc: "Test REST APIs quickly", icon: TestTube, path: "/dashboard/api-tester" },
];

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "All tools run client-side. No server round-trips, no waiting." },
  { icon: Shield, title: "Privacy First", desc: "Your data never leaves your browser. Everything is processed locally." },
  { icon: Terminal, title: "Developer Focused", desc: "Built by developers, for developers. Clean UI, powerful tools." },
];

const LandingPage = () => {
  const [dark, setDark] = useState(isDarkMode());

  const handleToggleTheme = () => {
    toggleTheme();
    setDark(isDarkMode());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">XenCoder</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleToggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/dashboard" className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Open Tools
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 border border-primary/20">
              <Zap className="w-3.5 h-3.5" />
              Developer Tools Suite
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              <span className="text-foreground">Code faster.</span>
              <br />
              <span className="gradient-text">Ship smarter.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A curated collection of essential developer tools. URL encoding, hashing, JWT debugging, JSON formatting — all in one beautiful workspace.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/dashboard" className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all glow-primary">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="px-8 py-3.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors">
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border border-border/50 bg-card hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 mx-auto rounded-xl bg-accent flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Your Developer Toolkit</h2>
            <p className="mt-3 text-muted-foreground">Essential tools, beautifully crafted</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link key={tool.path} to={tool.path} className="tool-card group flex items-start gap-4 hover:scale-[1.02]">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">XenCoder</span>
          </div>
          <p className="text-sm text-muted-foreground">Made by Ashish Ziniya</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
