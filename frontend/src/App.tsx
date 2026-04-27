import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout.tsx";
import { Home } from "@src/pages/home.tsx";
import { Login } from "@src/pages/login.tsx";
import { Dashboard } from "@src/pages/dashboard.tsx";
import { AppLayout } from "@src/layouts/AppLayout.tsx";
import {
  RedirectIfAuthenticated,
  RequireAuth,
} from "@src/components/auth-guards.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
