# claygendron.io

Personal portfolio site built with React and FastAPI.

## Tech Stack

**Frontend** — Vite, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

**Backend** — FastAPI, SQLAlchemy, PostgreSQL

**Design** — Kiln Editorial theme with Newsreader serif, Open Sans, and JetBrains Mono. Terracotta accent. Interactive physics ball in the hero.

## Development

```bash
# Install dependencies
bun install
cd frontend && bun install
cd ../backend && pip install -r requirements.txt

# Run both frontend and backend
bun run dev

# Or run individually
bun run dev:frontend   # Vite dev server
bun run dev:backend    # FastAPI with auto-reload
```

## Project Structure

```
frontend/       React SPA
  src/
    components/ UI and shared components
    pages/      Route pages
    hooks/      Custom hooks (physics, theme, analytics)
    content/    Project and post data
    lib/        Utilities and helpers
backend/        FastAPI API
  app/
    routes/     API endpoints (contact, analytics, admin)
```

## License

[MIT](LICENSE)
