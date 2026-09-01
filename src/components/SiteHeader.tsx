import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary">
            <BarChart3 className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-bold tracking-tight sm:text-lg">
            WORKER RANKING
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:text-foreground"
          >
            Ranking
          </Link>
          <Link
            to="/admin"
            className="rounded-md border border-border px-3 py-2 transition-colors hover:border-primary hover:bg-secondary"
          >
            Panel administratora
          </Link>
        </nav>
      </div>
    </header>
  );
}
