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
  Admin,
} from "@/pages";

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
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App;
