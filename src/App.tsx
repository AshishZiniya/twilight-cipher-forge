import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import useThemeInit from "@/hooks/use-theme";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import UrlEncoderPage from "./pages/tools/UrlEncoderPage";
import HashGeneratorPage from "./pages/tools/HashGeneratorPage";
import JwtDebuggerPage from "./pages/tools/JwtDebuggerPage";
import JsonFormatterPage from "./pages/tools/JsonFormatterPage";
import Base64Page from "./pages/tools/Base64Page";
import ColorConverterPage from "./pages/tools/ColorConverterPage";
import CronParserPage from "./pages/tools/CronParserPage";
import DiffCheckerPage from "./pages/tools/DiffCheckerPage";
import SqlFormatterPage from "./pages/tools/SqlFormatterPage";
import ApiTesterPage from "./pages/tools/ApiTesterPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useThemeInit();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="url-encoder" element={<UrlEncoderPage />} />
          <Route path="hash-generator" element={<HashGeneratorPage />} />
          <Route path="jwt-debugger" element={<JwtDebuggerPage />} />
          <Route path="json-formatter" element={<JsonFormatterPage />} />
          <Route path="base64" element={<Base64Page />} />
          <Route path="color-converter" element={<ColorConverterPage />} />
          <Route path="cron-parser" element={<CronParserPage />} />
          <Route path="diff-checker" element={<DiffCheckerPage />} />
          <Route path="sql-formatter" element={<SqlFormatterPage />} />
          <Route path="api-tester" element={<ApiTesterPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
