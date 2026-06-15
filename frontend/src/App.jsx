import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { LangProvider } from "./context/LangContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Income from "./pages/Income";
import Settings from "./pages/Settings";

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/clientes"  element={<Protected><Clients /></Protected>} />
            <Route path="/proyectos" element={<Protected><Projects /></Protected>} />
            <Route path="/ingresos"  element={<Protected><Income /></Protected>} />
            <Route path="/ajustes"  element={<Protected><Settings /></Protected>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
    </QueryClientProvider>
  );
}
