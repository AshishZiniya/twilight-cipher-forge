import { Link, useLocation } from "react-router-dom";
import { Code2, Hash, Key, Palette, Clock, FileCode, Globe, Braces, Home, User, Users, TestTube, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toggleTheme, isDarkMode } from "@/hooks/use-theme";

const tools = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "AI Chat", path: "/dashboard/chat", icon: MessageSquare },
  { name: "URL Encoder", path: "/dashboard/url-encoder", icon: Globe },
  { name: "Hash Generator", path: "/dashboard/hash-generator", icon: Hash },
  { name: "JWT Debugger", path: "/dashboard/jwt-debugger", icon: Key },
  { name: "JSON Formatter", path: "/dashboard/json-formatter", icon: Braces },
  { name: "Base64 Codec", path: "/dashboard/base64", icon: Code2 },
  { name: "Color Converter", path: "/dashboard/color-converter", icon: Palette },
  { name: "Cron Parser", path: "/dashboard/cron-parser", icon: Clock },
  { name: "Diff Checker", path: "/dashboard/diff-checker", icon: FileCode },
  { name: "SQL Formatter", path: "/dashboard/sql-formatter", icon: FileCode },
  { name: "API Tester", path: "/dashboard/api-tester", icon: TestTube },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(isDarkMode());

  const handleToggleTheme = () => {
    toggleTheme();
    setDark(isDarkMode());
  };

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">XenCoder</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tools.map((tool) => {
          const isActive = location.pathname === tool.path;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border border-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }
              `}
              title={collapsed ? tool.name : undefined}
            >
              <tool.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span>{tool.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleToggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          <User className="w-4 h-4" />
          {!collapsed && <span>Sign In</span>}
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
