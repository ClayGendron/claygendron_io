import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { KilnDivider, SectionHeader } from "@/components/shared";

export default function About() {
  return (
    <main className="min-h-[80vh] px-(--page-gutter) py-16 md:py-24">
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16"
        >
          <SectionHeader label="About" />
          <h1 className="font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] md:text-5xl lg:text-6xl">
            Building tools that
            <br />
            make a difference
          </h1>
        </motion.div>

        {/* Bio section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="grid gap-12 md:grid-cols-[7fr_5fr] md:gap-16"
        >
          <div className="space-y-6">
            <p className="max-w-[520px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              I'm{" "}
              <strong className="font-medium text-foreground">
                Clay Gendron
              </strong>
              , an AI engineer focused on building tools that make a meaningful
              difference. Currently leading GenAI efforts at Southern New
              Hampshire University, where I design and deploy intelligent
              systems that serve thousands of students.
            </p>
            <p className="max-w-[520px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              My flagship projects include{" "}
              <Link
                to="/projects/aila"
                className="text-primary hover:underline"
              >
                AILA
              </Link>
              , an AI Learning Assistant designed to tutor students while
              maintaining academic integrity, and{" "}
              <Link
                to="/projects/quiverdb"
                className="text-primary hover:underline"
              >
                QuiverDB
              </Link>
              , a graph database I'm positioning as "DuckDB for graph
              retrieval."
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
                <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-serif text-lg font-normal">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="my-16">
          <KilnDivider />
        </div>

        {/* What I do */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
        >
          <SectionHeader label="What I Work On" />
          <div>
            {[
              {
                num: "01",
                title: "AI & Machine Learning",
                desc: "Building production AI systems, from LangGraph agent architectures to retrieval-augmented generation pipelines.",
              },
              {
                num: "02",
                title: "Data Engineering",
                desc: "Designing data systems that scale, primarily in the Azure and Databricks ecosystem.",
              },
              {
                num: "03",
                title: "Education Technology",
                desc: "Creating tools that make education more accessible and effective through thoughtful AI integration.",
              },
              {
                num: "04",
                title: "Open Source",
                desc: "Contributing to and building tools that help other developers be more productive.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="border-b border-border py-7 first:border-t"
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-mono text-[0.7rem] text-muted-foreground">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="mb-2 font-serif text-xl font-normal">
                      {item.title}
                    </h3>
                    <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Philosophy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
          className="mt-16"
        >
          <SectionHeader label="Philosophy" />
          <blockquote className="border-l-2 border-primary py-2 pl-6">
            <p className="font-serif text-xl font-light leading-relaxed text-foreground/80 italic md:text-2xl">
              "I care about how things work, why they work well, and how to make
              them better."
            </p>
          </blockquote>
          <p className="mt-8 max-w-2xl leading-relaxed text-muted-foreground">
            At the intersection of my professional and personal worlds is a
            builder's mindset. I believe the best software comes from
            understanding problems deeply before reaching for solutions, and
            from caring about the details that most people never see.
          </p>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
          className="mt-20"
        >
          <KilnDivider />

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Want to work together or just chat?
            </p>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Get in touch
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
