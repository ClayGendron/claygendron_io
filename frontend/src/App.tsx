import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Home,
  Projects,
  ProjectDetail,
  About,
  Blog,
  BlogPost,
  Contact,
} from "@/pages";

const AdminRoot = lazy(() => import("@/admin"));

export function App() {
  // Initialize analytics and track page views
  useAnalytics();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center">
                <div className="size-6 animate-spin border-2 border-primary border-t-transparent rounded-full" />
              </div>
            }
          >
            <AdminRoot />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
