import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { KilnArena, KilnDivider, SectionHeader } from "@/components/shared";
import { getAllProjects } from "@/content/projects";
import { fetchPostIndex, formatDate, type PostMeta } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";

const projects = getAllProjects();

export default function Home() {
  const [posts, setPosts] = useState<PostMeta[]>([]);

  useEffect(() => {
    fetchPostIndex().then((p) => setPosts(p.slice(0, 3)));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="flex min-h-screen flex-col justify-center pb-16 pt-24">
        <KilnArena />

        {/* Hero inner content */}
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-[7fr_5fr] md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="max-w-[480px] text-[1.05rem] font-light leading-[1.75] text-muted-foreground">
                Building AI-powered tools that solve real problems. I care about
                craft, clarity, and shipping things that work.
              </p>
              <div className="mt-10 flex gap-4">
                <Link
                  to="/projects"
                  className="group inline-flex items-center gap-2 border border-foreground bg-transparent px-6 py-[0.7rem] text-[0.82rem] font-medium tracking-[0.02em] transition-all hover:bg-foreground hover:text-background"
                >
                  View my work&nbsp;
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-[0.4rem] py-[0.7rem] text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  About me
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pb-2 md:text-right"
            >
              <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
                Currently
              </p>
              <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">
                  Lead GenAI Engineer
                </strong>
                <br />
                <span className="text-primary">@</span> SNHU
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <KilnDivider />

      {/* SELECTED WORK */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-12 md:py-20">
        <SectionHeader label="Selected Work" />

        <div>
          {projects.map((project, index) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="group grid grid-cols-[2rem_1fr] items-baseline gap-4 border-b border-border py-[1.8rem] text-inherit no-underline transition-[border-color] first:border-t md:grid-cols-[3rem_1fr_2fr_auto] md:gap-8 hover:border-primary/10"
            >
              <span className="font-mono text-[0.7rem] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="font-serif text-[1.6rem] font-normal tracking-[-0.01em] transition-colors group-hover:text-primary">
                  {project.title}
                </div>
                <div className="mt-[0.4rem] flex gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <span className="hidden text-[0.88rem] leading-[1.5] text-muted-foreground md:block">
                {project.description}
              </span>
              <span className="hidden text-lg text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary md:block">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          to="/projects"
          className="mt-10 inline-flex items-center gap-[0.4rem] text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground"
        >
          View all projects <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* DIVIDER */}
      <KilnDivider />

      {/* ABOUT */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-12 md:py-20">
        <SectionHeader label="About" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[7fr_5fr] md:gap-16">
          <div>
            <p className="max-w-[520px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              I'm an AI engineer focused on building tools that make a
              meaningful difference. Currently leading GenAI efforts at{" "}
              <strong className="font-medium text-foreground">
                Southern New Hampshire University
              </strong>
              , where I design and deploy intelligent systems that serve
              thousands of students.
            </p>
            <p className="mt-6 max-w-[520px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              My work sits at the intersection of machine learning, software
              engineering, and education — building production-grade AI that's
              thoughtful about both capability and responsibility.
            </p>
          </div>
          <div className="grid grid-cols-2 content-start gap-8">
            {[
              { label: "Focus", value: "GenAI & ML Systems" },
              { label: "Location", value: "New Hampshire" },
              { label: "Languages", value: "Python, Rust, TS" },
              { label: "Interests", value: "Graphs, Agents, EdTech" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="mb-[0.3rem] font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-serif text-[1.1rem] font-normal">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <KilnDivider />

      {/* WRITING */}
      <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-12 md:py-20">
        <SectionHeader label="Writing" />

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group block border-t border-border py-8 text-inherit no-underline transition-[border-color] hover:border-primary"
              >
                <p className="mb-[0.8rem] font-mono text-[0.65rem] tracking-[0.05em] text-muted-foreground">
                  {formatDate(post.date)} &middot; {post.readingTime}
                </p>
                <h3 className="mb-[0.8rem] font-serif text-xl font-normal leading-[1.35] transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="text-[0.85rem] leading-[1.6] text-muted-foreground">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-[0.3rem] text-[0.78rem] text-muted-foreground transition-colors group-hover:text-primary">
                  Read <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-serif text-lg text-muted-foreground">
              No posts yet. Check back soon.
            </p>
          </div>
        )}

        <Link
          to="/blog"
          className="mt-10 inline-flex items-center gap-[0.4rem] text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground"
        >
          All posts <ArrowRight className="size-4" />
        </Link>
      </section>
    </>
  );
}
