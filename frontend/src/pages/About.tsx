import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { KilnDivider } from "@/components/shared";

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
          className="grid gap-12 md:grid-cols-[8fr_4fr] md:gap-16"
        >
          <div className="space-y-6">
            <p className="max-w-[720px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              I am{" "}
              <strong className="font-medium text-foreground">
                Clay Gendron
              </strong>
              , an AI Engineer and Data Scientist who is
              building and deploying AI agents — and their infrastructure —
              that unlock new capabilities for organizations. I currently
              work at{" "}
              <strong className="font-medium text-foreground">
                Southern New Hampshire University
              </strong>{" "}
              where I lead the development of an AI Learning Assistant product
              and a data analytics research and automation agent.
            </p>
            <p className="max-w-[720px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              I have been in the{" "}
              <strong className="font-medium text-foreground">
                AI Engineering space for 2 years
              </strong>{" "}
              and come with a{" "}
              <strong className="font-medium text-foreground">
                5 year background
              </strong>{" "}
              in Data Science and Business Intelligence, bringing with me a
              strong understanding of how to engineer an agent's context with
              enterprise-scale data sources. My main personal project at the
              moment is{" "}
              <a
                href="https://github.com/ClayGendron/grover"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              >
                Grover
              </a>
              , a virtual file system designed to act as a "semantic layer" for
              AI agents.
            </p>
            <p className="max-w-[720px] text-[1.05rem] leading-[1.8] text-muted-foreground">
              Outside of work, my interests include listening to music on my
              record player or iPod, taking time to read and learn something
              new, and developing a new monthly obsession.
            </p>
          </div>

          <div className="grid grid-cols-2 content-start gap-8">
            {[
              { label: "Focuses", value: "Enterprise Search, Agents, Full-Stack Development" },
              { label: "Stacks", value: "LangGraph, FastAPI, React" },
              { label: "Languages", value: "Python, SQL, TS" },
              { label: "Location", value: "Exeter, NH" },
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

        {/* Being excited about the future */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
        >
          <h2 className="mb-12 font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em]">
            Being excited about the future
          </h2>
          <blockquote className="max-w-[720px] border-l-2 border-primary py-2 pl-6">
            <p className="font-serif text-lg font-light leading-relaxed text-foreground/80 italic">
              "I care about understanding how things work, what makes them work
              well, and what the experience is like of using a tool."
            </p>
          </blockquote>
          <p className="mt-8 max-w-[720px] text-[1.05rem] leading-[1.8] text-muted-foreground">
            At the intersection of my professional and personal worlds is a
            builder's mindset. I believe our best work comes from the care we
            extend to each other and a continuous commitment to learn.
          </p>
          <p className="mt-6 max-w-[720px] text-[1.05rem] leading-[1.8] text-muted-foreground">
            These are the types of projects I am most interested in working on.
            If you are as well, I would love to{" "}
            <Link
              to="/contact"
              className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              connect
            </Link>{" "}
            and hear about what you are working on or want to build!
          </p>
        </motion.section>

        {/* Interests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
          className="mt-16"
        >
          <div>
            {[
              {
                num: "01",
                title: "Open Source",
                desc: "Contributing to and building tools that help other developers be more productive.",
              },
              {
                num: "02",
                title: "Enterprise Enablement",
                desc: "Building AI products that enterprises can own and customize to their needs.",
              },
              {
                num: "03",
                title: "Education Technology",
                desc: "Making learning tools worthy of the students using them.",
              },
              {
                num: "04",
                title: "Data Engineering",
                desc: "Getting the data right so all else can fall into place.",
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
      </div>
    </main>
  );
}
