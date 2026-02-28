import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { Send, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendlyEmbed, SectionHeader } from "@/components/shared";

// Set this to your Calendly URL to enable the embed
const CALENDLY_URL = ""; // e.g., "https://calendly.com/claygendron/30min"

interface FormState {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
}

export default function Contact() {
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ status: "submitting", message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setFormState({
          status: "success",
          message: result.message || "Message sent successfully!",
        });
      } else {
        setFormState({
          status: "error",
          message: result.detail || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setFormState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  const resetForm = () => {
    setFormState({ status: "idle", message: "" });
  };

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
          <SectionHeader label="Get in Touch" />
          <h1 className="font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] md:text-5xl lg:text-6xl">
            Contact
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Have a project in mind or just want to chat? I'd love to hear from
            you.
          </p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Send a message
            </p>

            {formState.status === "success" ? (
              <div className="flex flex-col items-center justify-center border border-border bg-card/30 px-6 py-12 text-center">
                <CheckCircle className="mb-4 size-10 text-green-500" />
                <h3 className="mb-2 text-lg font-medium">Message sent!</h3>
                <p className="text-sm text-muted-foreground">
                  {formState.message}
                </p>
                <Button variant="ghost" className="mt-4" onClick={resetForm}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {formState.status === "error" && (
                  <div className="flex items-start gap-3 border border-destructive/50 bg-destructive/10 p-4 text-sm">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <p className="text-destructive">{formState.message}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    className="h-9"
                    disabled={formState.status === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="h-9"
                    disabled={formState.status === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    placeholder="What would you like to discuss?"
                    className="min-h-32"
                    disabled={formState.status === "submitting"}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={formState.status === "submitting"}
                  className="h-9 w-full"
                >
                  {formState.status === "submitting" ? (
                    "Sending..."
                  ) : (
                    <>
                      Send message
                      <Send className="ml-2 size-3.5" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Calendly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Schedule a call
            </p>

            <div className="border border-border bg-card/30 p-6">
              <div className="mb-6 flex items-start gap-4">
                <div className="bg-primary/10 p-2.5 text-primary">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium">Book a time</h3>
                  <p className="text-sm text-muted-foreground">
                    Prefer a live conversation? Schedule a 30-minute call.
                  </p>
                </div>
              </div>

              {CALENDLY_URL ? (
                <CalendlyEmbed
                  url={CALENDLY_URL}
                  className="aspect-[4/3] overflow-hidden"
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center border border-dashed border-border bg-muted/30">
                  <Calendar className="mb-3 size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Calendly booking coming soon
                  </p>
                  <a
                    href="https://calendly.com/claygendron"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Open Calendly directly
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
