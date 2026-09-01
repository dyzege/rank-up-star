import { Trophy, Medal, Award } from "lucide-react";
import { formatPrice, type RankingEntry } from "@/lib/ranking.shared";
import { cn } from "@/lib/utils";

function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function rankIcon(place: number) {
  if (place === 1) return <Trophy className="size-4 text-gold" />;
  if (place === 2) return <Medal className="size-4 text-silver" />;
  if (place === 3) return <Award className="size-4 text-bronze" />;
  return null;
}

export function RankingList({ entries }: { entries: RankingEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="card-panel p-10 text-center text-muted-foreground">
        Brak pracowników w rankingu.
      </div>
    );
  }

  return (
    <ol className="grid gap-4">
      {entries.map((e, i) => {
        const place = i + 1;
        return (
          <li
            key={e.id}
            className={cn(
              "card-panel p-5 sm:p-6",
              place === 1 && "rank-medal-1",
              place === 2 && "rank-medal-2",
              place === 3 && "rank-medal-3",
            )}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex min-w-14 flex-col items-center justify-center rounded-lg border border-border bg-secondary px-3 py-2">
                  <span className="font-display text-xl font-bold">#{place}</span>
                  {rankIcon(place)}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">{e.name}</h3>
                  <p className="text-sm text-muted-foreground">{e.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:text-right lg:grid-cols-4">
                <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Wynik tygodnia
                  </p>
                  {e.weeklyScore === null ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Brak oceny za bieżący tydzień.
                    </p>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <ScoreBar value={e.weeklyScore} />
                      <span className="whitespace-nowrap text-sm font-medium">
                        {e.weeklyScore}/100
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Punkty zasługi
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-primary">
                    {e.meritPoints === 0
                      ? "Brak punktów zasługi."
                      : `${e.meritPoints > 0 ? "+" : ""}${e.meritPoints}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Wynik całkowity
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">{e.totalScore}</p>
                </div>
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Cena towaru
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-primary">
                    {formatPrice(e.price)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
