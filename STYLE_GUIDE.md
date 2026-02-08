# Clay Gendron — Design Language

A comprehensive style guide for developers implementing the claygendron.io visual identity.

---

## Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Quiet Luxury** | Refined elegance through restraint, not excess. Every element earns its place. |
| **Editorial Precision** | Magazine-quality typography and layout. Content is king, design serves it. |
| **Subtle Geometry** | Angular accents and mathematical harmony—never busy, always intentional. |
| **Weighted Presence** | Designs should feel substantial and grounded, with depth and gravitas. |

### The Feeling

The design should evoke the experience of reading a beautifully typeset book in a modern architecture firm's lobby—sophisticated, calm, confident, and intellectually engaging.

**Keywords:** Refined, Professional, Confident, Understated, Technical, Trustworthy

---

## Color Palette

### Primary Colors

```css
/* Light Mode */
--background: #ffffff;
--foreground: #141414;
--muted: #666666;
--subtle: #999999;
--border: #eeeeee;

/* Dark Mode (for contrast sections) */
--background-dark: #0f0f0f;
--foreground-dark: #ffffff;
--muted-dark: rgba(255, 255, 255, 0.5);
--border-dark: rgba(255, 255, 255, 0.1);
```

### Accent Color

```css
/* Amber/Gold — The single accent color */
--accent: #d4a853;
--accent-hover: #b8860b;
--accent-subtle: rgba(212, 168, 83, 0.15);
--accent-line: rgba(212, 168, 83, 0.12);
```

### Usage Rules

| Element | Color |
|---------|-------|
| Body text | `--foreground` (#141414) |
| Secondary text | `--muted` (#666) |
| Tertiary text (labels, meta) | `--subtle` (#999) |
| Interactive hover states | `--accent` (#d4a853) |
| Geometric accents | `--accent` at 10-20% opacity |
| Borders | `--border` (#eee) or `--accent-subtle` |
| Dark sections | `--background-dark` with inverted text |

### What NOT to Do

- Never use multiple accent colors
- Avoid colored backgrounds (except dark sections)
- Don't use amber for large filled areas—it's an accent, not a primary
- No gradients except subtle ambient effects

---

## Typography

### Font Stack

```css
/* Display/Headlines — Elegant Serif */
--font-display: 'DM Serif Display', Georgia, serif;

/* Alternative serifs (acceptable) */
--font-serif-alt: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;

/* Body Text — Clean Sans */
--font-body: 'Open Sans Variable', system-ui, sans-serif;

/* Code/Mono */
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Type Scale

| Element | Size | Weight | Letter Spacing | Font |
|---------|------|--------|----------------|------|
| Hero headline | 5rem–7rem | 400 (light) | -0.025em | Display serif |
| Section headline | 2rem–3rem | 400 | -0.02em | Display serif |
| Subheadline | 1.25rem | 400 | normal | Body sans |
| Body copy | 1rem–1.125rem | 400 | normal | Body sans |
| Small/Meta | 0.75rem | 500 | 0.1em–0.2em | Body sans, uppercase |
| Code | 0.875rem | 400 | normal | Mono |

### Typography Patterns

**Labels & Categories**
```css
.label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--subtle);
}
```

**Headlines**
```css
.headline {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.025em;
}
```

**Body Copy**
```css
.body {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--muted);
  max-width: 32rem; /* ~520px for readability */
}
```

---

## Layout & Spacing

### Grid System

- **Max content width:** 1200px (6xl)
- **Page padding:** 3rem (48px) on desktop, 1.5rem (24px) on mobile
- **Section spacing:** 8rem (128px) vertical padding
- **Component gaps:** 1rem–1.5rem

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Layout Patterns

**Hero Section**
- Full viewport height (`min-h-screen`)
- Content vertically centered
- Generous whitespace around text
- Optional geometric accent in corner

**Content Sections**
- 12-column grid for complex layouts
- Asymmetric splits (8/4 or 7/5) preferred over 6/6
- Dark sections for contrast and visual weight

**List/Project Items**
- Full-width with border-bottom
- Consistent vertical padding (2rem)
- Grid layout: number | title | description | arrow

---

## Geometric Accents

### Core Elements

**Diamond/Square Marker**
```jsx
<div
  className="size-1.5 bg-accent"
  style={{ transform: 'rotate(45deg)' }}
/>
```

**Line Accents**
```jsx
<div className="w-8 h-px bg-accent opacity-50" />
<div className="w-px h-16 bg-foreground opacity-10" />
```

**Corner Frames**
```jsx
// Top-right corner
<div className="absolute top-8 right-8">
  <div className="w-16 h-px bg-foreground/10" />
  <div className="w-px h-16 bg-foreground/10 absolute top-0 right-0" />
</div>
```

**Diagonal Lines (SVG)**
```jsx
<svg className="absolute inset-0 w-full h-full pointer-events-none">
  <line
    x1="0" y1="85%" x2="25%" y2="0"
    stroke="var(--accent)"
    strokeWidth="1"
    opacity="0.12"
  />
</svg>
```

### Usage Guidelines

| Do | Don't |
|----|-------|
| Use single diagonal line as subtle accent | Multiple crossing lines |
| Small diamond markers for bullet points | Large geometric shapes |
| Corner frames for visual anchoring | Busy patterns or grids |
| 10-20% opacity for geometric elements | Full-opacity geometric fills |
| Static or very slow rotation (60s+) | Fast or distracting animations |

---

## Motion & Animation

### Philosophy

Motion should feel like a gentle exhale—smooth, natural, and never jarring. Animations enhance content discovery, they don't distract from it.

### Timing

```css
--duration-fast: 200ms;
--duration-base: 300ms;
--duration-slow: 500ms;
--duration-slower: 800ms;

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Patterns

**Page Load Stagger**
```jsx
// Elements fade in sequentially
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, delay: index * 0.1 }}
```

**Hover States**
```jsx
// Subtle lift and color change
className="hover:text-accent transition-colors"
className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
```

**Parallax (Subtle)**
```jsx
// Floating elements move slower than scroll
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
```

**Line Drawing**
```jsx
// Geometric lines draw in on load
initial={{ pathLength: 0 }}
animate={{ pathLength: 1 }}
transition={{ duration: 1.5, delay: 0.5 }}
```

### Motion Rules

| Do | Don't |
|----|-------|
| 0.3–0.8s durations | Animations over 1.5s |
| Ease-out for entrances | Linear or bounce easing |
| Stagger delays of 0.05–0.1s | Everything animating at once |
| Parallax shifts of 40–120px | Extreme parallax (200px+) |
| Animate opacity and transform | Animate colors or sizes aggressively |

---

## Components

### Buttons

**Primary Button**
```jsx
<Link className="inline-flex items-center gap-3 px-5 py-2.5 border border-foreground text-sm hover:bg-foreground hover:text-background transition-all">
  <span>View work</span>
  <ArrowUpRight className="size-4" />
</Link>
```

**Text Link**
```jsx
<Link className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors">
  About me
</Link>
```

**Accent Link**
```jsx
<Link className="text-accent hover:text-accent-hover transition-colors">
  Contact →
</Link>
```

### Cards

**Project Card (List Style)**
```jsx
<Link className="group grid grid-cols-12 gap-6 items-center py-8 border-b border-border hover:border-accent/30 transition-colors">
  <span className="col-span-1 text-xs text-subtle font-mono">01</span>
  <div className="col-span-4">
    <h3 className="text-2xl font-display group-hover:text-accent transition-colors">
      Project Name
    </h3>
  </div>
  <p className="col-span-5 text-muted text-sm">
    Project description here.
  </p>
  <div className="col-span-2 flex justify-end">
    <ArrowUpRight className="size-5 text-subtle group-hover:text-accent transition-all" />
  </div>
</Link>
```

### Section Headers

**With Geometric Accent**
```jsx
<div className="flex items-center gap-4 mb-12">
  <div className="size-1.5 bg-accent" style={{ transform: 'rotate(45deg)' }} />
  <div className="w-8 h-px bg-border" />
  <p className="text-xs uppercase tracking-widest text-subtle">
    Section Title
  </p>
</div>
```

### Dividers

**With Diamond**
```jsx
<div className="flex items-center gap-6 my-16">
  <div className="flex-1 h-px bg-border" />
  <div className="size-2 bg-accent" style={{ transform: 'rotate(45deg)' }} />
  <div className="flex-1 h-px bg-border" />
</div>
```

---

## Dark Sections

Use dark sections sparingly for visual weight and to create contrast. Typically used for:
- Featured work/projects
- Call-to-action areas
- Footer

```jsx
<section className="bg-[#0f0f0f] text-white px-12 py-32">
  {/* Subtle diagonal accent */}
  <svg className="absolute inset-0 pointer-events-none">
    <line x1="100%" y1="0" x2="70%" y2="100%"
      stroke="var(--accent)" strokeWidth="1" opacity="0.08" />
  </svg>

  {/* Content */}
  <div className="relative z-10">
    {/* Use text-white/50 for muted, text-accent for highlights */}
  </div>
</section>
```

---

## Iconography

### Style

- Use Lucide icons exclusively
- Size: 16px (size-4) for inline, 20px (size-5) for standalone
- Stroke width: default (2px)
- Color: inherit from text color

### Common Icons

| Use Case | Icon |
|----------|------|
| External link / View | `ArrowUpRight` |
| Next / Continue | `ArrowRight` |
| Back | `ArrowLeft` or `← text` |
| Contact / Email | `Mail` |
| Location | `MapPin` |
| Work/Career | `Briefcase` |

---

## Responsive Behavior

### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

### Key Adaptations

| Element | Desktop | Mobile |
|---------|---------|--------|
| Hero headline | 5rem–7rem | 2.5rem–3rem |
| Page padding | 3rem | 1.5rem |
| Grid columns | 12 | Stack vertically |
| Geometric accents | Visible | Hidden or simplified |
| Navigation | Horizontal | Hamburger menu |

---

## Implementation Checklist

When building a new page or component:

- [ ] Uses only the defined color palette
- [ ] Typography follows the scale (serif headlines, sans body)
- [ ] Spacing uses the defined scale
- [ ] Has at least one subtle geometric accent
- [ ] Animations are smooth and under 1s
- [ ] Hover states use accent color
- [ ] Dark sections have proper contrast
- [ ] Mobile responsive
- [ ] Content has room to breathe (whitespace)

---

## Reference Demos

To see these principles in action, visit `/demos`:

| Demo | Best Example Of |
|------|-----------------|
| **Refined Edge** (`/demos/refined`) | The complete design language |
| **Monochrome Ink** (`/demos/monochrome`) | Editorial typography and restraint |
| **Quiet Geometry** (`/demos/quiet`) | Subtle geometric accents |
| **Weighted Ink** (`/demos/weighted`) | Parallax and visual weight |

---

*Last updated: January 2024*
