import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computePrice, type MeritRow, type ReviewRow } from "./ranking.shared";

const scoreField = z.coerce.number().int().min(0).max(20);

const loginSchema = z.object({ password: z.string().min(1).max(200) });
const employeeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
});
const toggleSchema = z.object({ id: z.string().uuid(), active: z.boolean() });
const meritSchema = z.object({
  employeeId: z.string().uuid(),
  points: z.coerce.number().int().min(-100).max(100),
  reason: z.string().trim().min(3).max(500),
});
const reviewSchema = z.object({
  employeeId: z.string().uuid(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  productivity: scoreField,
  quality: scoreField,
  engagement: scoreField,
  teamwork: scoreField,
  discipline: scoreField,
  note: z.string().trim().max(1000).optional().default(""),
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { createSession, sha256, timingSafeEqualStr, logAudit } = await import(
      "./admin-session.server"
    );
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected) throw new Error("ADMIN_PASSWORD nie jest skonfigurowane");

    const ok = timingSafeEqualStr(await sha256(data.password), await sha256(expected));
    if (!ok) return { ok: false as const };

    await createSession();
    await logAudit("admin_login", null, "Zalogowano do panelu administratora");
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { destroySession } = await import("./admin-session.server");
  await destroySession();
  return { ok: true as const };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const { isAuthenticated } = await import("./admin-session.server");
  return { authenticated: await isAuthenticated() };
});

export const adminEmployees = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  const db = await requireAdmin();
  const { data } = await db
    .from("employees")
    .select("id, name, role, active, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const adminStats = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
  const { getRanking } = await import("./ranking.functions");
  const ranking = await getRanking();
  const totalMerit = ranking.reduce((s, e) => s + e.meritPoints, 0);
  const avg =
    ranking.length > 0
      ? Math.round(ranking.reduce((s, e) => s + e.totalScore, 0) / ranking.length)
      : 0;
  return {
    activeEmployees: ranking.length,
    topEmployee: ranking[0]?.name ?? null,
    averageScore: avg,
    totalMerit,
    highestPrice: ranking.length > 0 ? Math.max(...ranking.map((e) => e.price)) : 0,
  };
});

export const adminCreateEmployee = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => employeeSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin, logAudit } = await import("./admin-session.server");
    const db = await requireAdmin();
    const { data: row, error } = await db
      .from("employees")
      .insert({ name: data.name, role: data.role })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit("employee_created", row.id, `${data.name} — ${data.role}`);
    return { ok: true as const };
  });

export const adminToggleEmployee = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => toggleSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin, logAudit } = await import("./admin-session.server");
    const db = await requireAdmin();
    const { error } = await db
      .from("employees")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(
      data.active ? "employee_activated" : "employee_deactivated",
      data.id,
      data.active ? "Aktywowano pracownika" : "Dezaktywowano pracownika",
    );
    return { ok: true as const };
  });

export const adminAddMerit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => meritSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin, logAudit } = await import("./admin-session.server");
    const db = await requireAdmin();
    const { error } = await db.from("merit_points").insert({
      employee_id: data.employeeId,
      points: data.points,
      reason: data.reason,
    });
    if (error) throw new Error(error.message);
    await logAudit("merit_granted", data.employeeId, `${data.points} pkt — ${data.reason}`);
    return { ok: true as const };
  });

export const adminSaveReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reviewSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin, logAudit } = await import("./admin-session.server");
    const db = await requireAdmin();
    const payload = {
      employee_id: data.employeeId,
      week_start: data.weekStart,
      productivity: data.productivity,
      quality: data.quality,
      engagement: data.engagement,
      teamwork: data.teamwork,
      discipline: data.discipline,
      note: data.note || null,
    };
    const { error } = await db
      .from("weekly_reviews")
      .upsert(payload, { onConflict: "employee_id,week_start" });
    if (error) throw new Error(error.message);
    const score =
      data.productivity +
      data.quality +
      data.engagement +
      data.teamwork +
      data.discipline;
    await logAudit("review_saved", data.employeeId, `Tydzień ${data.weekStart}: ${score}/100`);
    return { ok: true as const, score };
  });

export const adminHistory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    const db = await requireAdmin();

    const { data: employee } = await db
      .from("employees")
      .select("id, name, role, active, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!employee) throw new Error("Nie znaleziono pracownika");

    const { data: reviews } = await db
      .from("weekly_reviews")
      .select(
        "id, week_start, productivity, quality, engagement, teamwork, discipline, note, created_at",
      )
      .eq("employee_id", data.id)
      .order("week_start", { ascending: false });

    const { data: merits } = await db
      .from("merit_points")
      .select("id, points, reason, created_at")
      .eq("employee_id", data.id)
      .order("created_at", { ascending: false });

    const meritTotal = (merits ?? []).reduce((s, m) => s + m.points, 0);
    const priceHistory = (reviews ?? []).map((r) => {
      const score =
        r.productivity + r.quality + r.engagement + r.teamwork + r.discipline;
      const total = score + meritTotal;
      return {
        weekStart: r.week_start,
        score: total,
        price: computePrice(total),
        date: r.created_at,
      };
    });

    return {
      employee,
      reviews: (reviews ?? []) as ReviewRow[],
      merits: (merits ?? []) as MeritRow[],
      priceHistory,
    };
  });
