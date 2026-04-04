import { Routes, Route, Navigate } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./auth/msalConfig";
import { AuthGuard } from "./auth/AuthGuard";
import { AdminLayout } from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectForm from "./pages/projects/ProjectForm";
import PostsList from "./pages/posts/PostsList";
import PostForm from "./pages/posts/PostForm";
import AboutEditor from "./pages/about/AboutEditor";
import Analytics from "./pages/analytics/Analytics";

export default function AdminRoot() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthGuard>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectForm />} />
            <Route path="posts" element={<PostsList />} />
            <Route path="posts/new" element={<PostForm />} />
            <Route path="posts/:id" element={<PostForm />} />
            <Route path="about" element={<AboutEditor />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="callback" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AuthGuard>
    </MsalProvider>
  );
}
