import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./layouts/ProtectedRoute.jsx";
import { DashboardLayout } from "./layouts/DashboardLayout.jsx";
import { PageLoader } from "./components/ui/Feedback.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

// Heavier routes (builder, charts, public renderer) are code-split.
const Templates = lazy(() => import("./pages/Templates.jsx"));
const Builder = lazy(() => import("./pages/Builder.jsx"));
const Responses = lazy(() => import("./pages/Responses.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const PublicForm = lazy(() => import("./pages/PublicForm.jsx"));
const Insights = lazy(() => import("./pages/Insights.jsx"));
const Inbox = lazy(() => import("./pages/Inbox.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const MyForms = lazy(() => import("./pages/MyForms.jsx"));

function Lazy({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      {/* Public auth */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Public shareable form */}
      <Route
        path="/f/:slug"
        element={
          <Lazy>
            <PublicForm />
          </Lazy>
        }
      />

      {/* Builder is full-screen, outside the dashboard shell */}
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <Lazy>
              <Builder />
            </Lazy>
          </ProtectedRoute>
        }
      />

      {/* Dashboard shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/forms"
          element={
            <Lazy>
              <MyForms />
            </Lazy>
          }
        />
        <Route
          path="/insights"
          element={
            <Lazy>
              <Insights />
            </Lazy>
          }
        />
        <Route
          path="/inbox"
          element={
            <Lazy>
              <Inbox />
            </Lazy>
          }
        />
        <Route
          path="/settings"
          element={
            <Lazy>
              <Settings />
            </Lazy>
          }
        />
        <Route
          path="/templates"
          element={
            <Lazy>
              <Templates />
            </Lazy>
          }
        />
        <Route
          path="/forms/:id/responses"
          element={
            <Lazy>
              <Responses />
            </Lazy>
          }
        />
        <Route
          path="/forms/:id/analytics"
          element={
            <Lazy>
              <Analytics />
            </Lazy>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
