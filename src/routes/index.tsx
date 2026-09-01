import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getRanking } from "@/lib/ranking.functions";
import { RankingList } from "@/components/RankingList";
import { SiteHeader } from "@/components/SiteHeader";

const rankingQuery = queryOptions({
  queryKey: ["ranking"],
  queryFn: () => getRanking(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WORKER RANKING — cotygodniowy ranking pracowników" },
      {
        name: "description",
        content:
          "Publiczny ranking pracowników: wynik tygodnia, punkty zasługi, wynik całkowity i cena towaru. Aktualizowany co tydzień.",
      },
      { property: "og:title", content: "WORKER RANKING — ranking pracowników" },
      {
        property: "og:description",
        content:
          "Sprawdź aktualny ranking pracowników: oceny tygodniowe, punkty zasługi i wyliczoną cenę towaru.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(rankingQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(rankingQuery);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="mb-10">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Ranking pracowników
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            System cotygodniowej oceny pracowników. Każdy pracownik oceniany jest w pięciu
            kategoriach (maks. 100 punktów), może otrzymać dodatkowe punkty zasługi, a na
            podstawie wyniku całkowitego wyliczana jest cena towaru.
          </p>
        </section>
        <RankingList entries={data} />
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        WORKER RANKING · dane aktualizowane po każdej ocenie
      </footer>
    </div>
  );
}
