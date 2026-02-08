import { useRef } from "react";
import { useKilnPhysics } from "@/hooks/useKilnPhysics";

export function KilnArena() {
  const frameRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const aimLineRef = useRef<SVGLineElement>(null);
  const aimDirRef = useRef<SVGLineElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useKilnPhysics({
    frameRef,
    arenaRef,
    ballRef,
    titleRef,
    line1Ref,
    line2Ref,
    markRef,
    aimLineRef,
    aimDirRef,
    labelRef,
  });

  return (
    <>
      <style>{`
        .hero-frame-kiln {
          position: relative;
          padding: 3rem max(3rem, calc((100% - 1200px) / 2)) 2.5rem;
        }
        .hero-frame-kiln::before,
        .hero-frame-kiln::after {
          content: '';
          position: absolute;
          top: 0;
          height: 0;
          border-top: 1px dashed var(--border);
          transition: border-color 0.35s ease;
        }
        .hero-frame-kiln::before {
          left: 0;
          width: var(--label-left, 0px);
        }
        .hero-frame-kiln::after {
          left: var(--label-right, 0px);
          right: 0;
        }
        .hero-label-kiln {
          left: max(1.5rem, calc((100% - 1200px) / 2));
        }
        @media (max-width: 768px) {
          .hero-frame-kiln { padding: 2rem 1.5rem 1.5rem; }
          .hero-label-kiln { left: 1rem; }
        }
      `}</style>

      <div
        ref={frameRef}
        className="hero-frame-kiln relative mb-8 border-b border-dashed border-border transition-[border-color] duration-350"
      >
        {/* Label on top border */}
        <span
          ref={labelRef}
          className="hero-label-kiln absolute top-0 -translate-y-1/2 px-3 font-mono text-[0.7rem] font-normal uppercase tracking-[0.2em] text-muted-foreground"
        >
          AI Engineer
        </span>

        {/* Title */}
        <div>
          <h1
            ref={titleRef}
            className="relative font-serif text-[clamp(3.5rem,7vw,6.5rem)] font-light leading-[1.02] tracking-[-0.03em]"
          >
            <span ref={line1Ref}>Clay</span>
            <br />
            <span ref={line2Ref}>Gendron</span>
            <span
              ref={markRef}
              className="mb-[-1px] ml-2 inline-block size-[10px] origin-[center_bottom] cursor-pointer rounded-full bg-primary align-baseline transition-shadow duration-250 hover:shadow-[0_0_0_4px_rgba(194,69,45,0.08)]"
              style={{
                opacity: 0,
                animation: "kiln-drop 1.3s linear 0.7s both",
              }}
            />
          </h1>
        </div>

        {/* Physics arena */}
        <div
          ref={arenaRef}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden [&.active]:pointer-events-auto"
        >
          <div
            ref={ballRef}
            className="pointer-events-auto absolute z-[2] hidden size-[10px] cursor-grab rounded-full bg-primary transition-shadow duration-200 [&.dragging]:cursor-grabbing"
          />
          <svg
            className="pointer-events-none absolute inset-0 z-[1] size-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              ref={aimLineRef}
              className="stroke-primary"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              style={{ opacity: 0, transition: "opacity 0.12s" }}
              x1="0"
              y1="0"
              x2="0"
              y2="0"
            />
            <line
              ref={aimDirRef}
              className="stroke-primary"
              strokeWidth="1"
              strokeDasharray="2 3"
              style={{ opacity: 0, transition: "opacity 0.12s" }}
              x1="0"
              y1="0"
              x2="0"
              y2="0"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
