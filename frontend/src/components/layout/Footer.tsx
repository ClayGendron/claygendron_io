import { Mail } from "lucide-react";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialLinks = [
  { href: "https://github.com/claygendron", icon: GitHubIcon, label: "GitHub" },
  { href: "https://linkedin.com/in/claygendron", icon: LinkedInIcon, label: "LinkedIn" },
  { href: "mailto:clay@claygendron.io", icon: Mail, label: "Email" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0f0e0c] text-white transition-[background] duration-350 ease-in-out dark:bg-[#0a0a09]">
      {/* Grain texture on footer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Diagonal accent */}
      <svg
        className="pointer-events-none absolute inset-0 z-[1]"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
      >
        <line
          x1="100%"
          y1="0"
          x2="65%"
          y2="100%"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary opacity-[0.06]"
        />
      </svg>

      <div className="relative z-[2] px-(--page-gutter) pt-24 pb-6">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[7fr_5fr] md:gap-16">
          {/* Left: CTA */}
          <div>
            <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/30">
              Get in touch
            </p>
            <h2 className="mb-8 font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1.1] tracking-[-0.02em]">
              Let's build
              <br />
              something together.
            </h2>
            <a
              href="mailto:clay@claygendron.io"
              className="inline-flex items-center gap-2 border border-white/25 px-6 py-3 text-[0.82rem] font-normal text-white transition-all duration-250 hover:border-primary hover:text-primary"
            >
              Contact me &nbsp;&rarr;
            </a>
          </div>

          {/* Right: Social links */}
          <div className="flex flex-col items-start gap-3 md:items-end md:justify-end">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-[0.82rem] text-white/35 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Calendly placeholder */}
        <div className="mt-12">
          <div className="border border-dashed border-white/12 p-12 text-center font-mono text-[0.65rem] uppercase tracking-[0.1em] text-white/20">
            [ Calendly embed — book a call ]
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-16 flex items-center justify-between">
          <span className="font-mono text-[0.7rem] text-white/20">
            &copy; {currentYear} Clay Gendron
          </span>
          <span className="font-mono text-[0.7rem] text-white/20">
            claygendron.io
          </span>
        </div>
      </div>
    </footer>
  );
}
