import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AimikoProvider } from "@/context/AimikoContext";
import PreRegistration from "./pages/PreRegistration";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AimikoProvider>
          <Routes>
            {/* ── Official www.aimiko.in Pre-Registration & Early Access Launchpad ── */}
            <Route path="/" element={<PreRegistration />} />
            <Route path="/preregister" element={<PreRegistration />} />
            <Route path="/early-access" element={<PreRegistration />} />
            
            {/* Legal */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Strict Lock: Any other route redirects directly to Pre-Registration */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AimikoProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
