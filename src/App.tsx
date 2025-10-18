import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { RegisterEG } from "./components/RegisterEG";
import { UserManagement } from "./components/UserManagement";
import { TestFirestore } from "./components/TestFirestore";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/test" element={<TestFirestore />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-eg"
            element={
              <ProtectedRoute>
                <RegisterEG />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
