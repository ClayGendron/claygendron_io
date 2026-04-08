import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { CalEmbed } from "@/components/shared";

export default function Contact() {
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
            Contact
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Have a project in mind or just want to chat? I'd love to hear from
            you.
          </p>
          <a
            href="mailto:chg@claygendron.io"
            className="mt-6 inline-flex items-center gap-2 border border-foreground px-6 py-3 text-[0.82rem] text-foreground transition-all duration-250 hover:border-primary hover:text-primary"
          >
            <Mail className="size-4" />
            Send me an email
          </a>
        </motion.div>

        {/* Booking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Schedule a call
          </p>

          <CalEmbed
            calLink="clay-gendron/meet-45"
            className="overflow-visible"
          />
        </motion.div>
      </div>
    </main>
  );
}
