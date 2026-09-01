import { computePrice, type RankingEntry } from "./ranking.shared";

export async function computeRanking(): Promise<RankingEntry[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: employees } = await supabaseAdmin
    .from("employees")
    .select("id, name, role")
    .eq("active", true);

  if (!employees || employees.length === 0) return [];

  const ids = employees.map((e) => e.id);

  const { data: reviews } = await supabaseAdmin
    .from("weekly_reviews")
    .select("employee_id, week_start, productivity, quality, engagement, teamwork, discipline")
    .in("employee_id", ids)
    .order("week_start", { ascending: false });

  const { data: merits } = await supabaseAdmin
    .from("merit_points")
    .select("employee_id, points")
    .in("employee_id", ids);

  const latest = new Map<string, { score: number; week: string }>();
  for (const r of reviews ?? []) {
    if (latest.has(r.employee_id)) continue;
    latest.set(r.employee_id, {
      score: r.productivity + r.quality + r.engagement + r.teamwork + r.discipline,
      week: r.week_start,
    });
  }

  const meritTotals = new Map<string, number>();
  for (const m of merits ?? []) {
    meritTotals.set(m.employee_id, (meritTotals.get(m.employee_id) ?? 0) + m.points);
  }

  const entries: RankingEntry[] = employees.map((e) => {
    const weekly = latest.get(e.id) ?? null;
    const merit = meritTotals.get(e.id) ?? 0;
    const total = (weekly?.score ?? 0) + merit;
    return {
      id: e.id,
      name: e.name,
      role: e.role,
      weeklyScore: weekly ? weekly.score : null,
      weekStart: weekly ? weekly.week : null,
      meritPoints: merit,
      totalScore: total,
      price: computePrice(total),
    };
  });

  entries.sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name));
  return entries;
}
