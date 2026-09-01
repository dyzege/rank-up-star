import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCw } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminAddMerit,
  adminCreateEmployee,
  adminEmployees,
  adminHistory,
  adminLogin,
  adminLogout,
  adminMe,
  adminSaveReview,
  adminStats,
  adminToggleEmployee,
} from "@/lib/admin.functions";
import { formatPrice } from "@/lib/ranking.shared";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel administratora — WORKER RANKING" },
      {
        name: "description",
        content:
          "Zabezpieczony panel administratora: pracownicy, oceny tygodniowe, punkty zasługi i historia.",
      },
      { property: "og:title", content: "Panel administratora — WORKER RANKING" },
      {
        property: "og:description",
        content: "Zarządzaj pracownikami, ocenami tygodniowymi i punktami zasługi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function currentMonday(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function AdminPage() {
  const me = useQuery({ queryKey: ["admin", "me"], queryFn: () => adminMe() });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {me.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Ładowanie…
          </div>
        ) : me.data?.authenticated ? (
          <Dashboard />
        ) : (
          <LoginCard />
        )}
      </main>
    </div>
  );
}

function LoginCard() {
  const qc = useQueryClient();
  const login = useServerFn(adminLogin);
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: (pwd: string) => login({ data: { password: pwd } }),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Zalogowano");
        qc.invalidateQueries({ queryKey: ["admin"] });
      } else {
        toast.error("Nieprawidłowe hasło");
      }
    },
    onError: () => toast.error("Logowanie nie powiodło się"),
  });

  return (
    <div className="mx-auto max-w-sm card-panel p-6">
      <h1 className="font-display text-xl font-bold">Panel administratora</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Podaj hasło administratora, aby uzyskać dostęp.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!password.trim()) {
            toast.error("Podaj hasło");
            return;
          }
          mutation.mutate(password);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          ZALOGUJ
        </Button>
      </form>
    </div>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const logout = useServerFn(adminLogout);

  const employees = useQuery({
    queryKey: ["admin", "employees"],
    queryFn: () => adminEmployees(),
  });
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: () => adminStats() });

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["ranking"] });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Panel administratora</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="size-4" /> Odśwież
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout({});
              qc.clear();
              toast.success("Wylogowano");
            }}
          >
            <LogOut className="size-4" /> Wyloguj
          </Button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Aktywni pracownicy" value={stats.data?.activeEmployees ?? "—"} />
        <StatCard label="Najlepszy pracownik" value={stats.data?.topEmployee ?? "—"} />
        <StatCard label="Średni wynik" value={stats.data?.averageScore ?? "—"} />
        <StatCard label="Punkty zasługi" value={stats.data?.totalMerit ?? "—"} />
        <StatCard
          label="Najwyższa cena"
          value={stats.data ? formatPrice(stats.data.highestPrice) : "—"}
        />
      </section>

      <Tabs defaultValue="employees">
        <TabsList className="flex-wrap">
          <TabsTrigger value="employees">Pracownicy</TabsTrigger>
          <TabsTrigger value="review">Ocena tygodniowa</TabsTrigger>
          <TabsTrigger value="merit">Punkty zasługi</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          <EmployeesSection employees={employees.data ?? []} loading={employees.isLoading} />
        </TabsContent>
        <TabsContent value="review" className="mt-6">
          <ReviewSection employees={employees.data ?? []} />
        </TabsContent>
        <TabsContent value="merit" className="mt-6">
          <MeritSection employees={employees.data ?? []} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <HistorySection employees={employees.data ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-panel p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

type Employee = {
  id: string;
  name: string;
  role: string;
  active: boolean;
  created_at: string;
};

function useRefresh() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["ranking"] });
  };
}

function EmployeesSection({
  employees,
  loading,
}: {
  employees: Employee[];
  loading: boolean;
}) {
  const refresh = useRefresh();
  const create = useServerFn(adminCreateEmployee);
  const toggle = useServerFn(adminToggleEmployee);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [pending, setPending] = useState<Employee | null>(null);

  const createMutation = useMutation({
    mutationFn: () => create({ data: { name, role } }),
    onSuccess: () => {
      toast.success("Dodano pracownika");
      setName("");
      setRole("");
      refresh();
    },
    onError: () => toast.error("Nie udało się dodać pracownika"),
  });

  const toggleMutation = useMutation({
    mutationFn: (emp: Employee) => toggle({ data: { id: emp.id, active: !emp.active } }),
    onSuccess: () => {
      toast.success("Zaktualizowano status pracownika");
      refresh();
    },
    onError: () => toast.error("Nie udało się zmienić statusu"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form
        className="card-panel h-fit space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2 || role.trim().length < 2) {
            toast.error("Uzupełnij imię i nazwisko oraz stanowisko");
            return;
          }
          createMutation.mutate();
        }}
      >
        <h2 className="font-display text-lg font-semibold">Dodaj pracownika</h2>
        <div className="space-y-2">
          <Label htmlFor="emp-name">Imię i nazwisko</Label>
          <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-role">Stanowisko</Label>
          <Input id="emp-role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={80} />
        </div>
        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          DODAJ PRACOWNIKA
        </Button>
      </form>

      <div className="card-panel p-5">
        <h2 className="font-display text-lg font-semibold">Lista pracowników</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Ładowanie…</p>
        ) : employees.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Brak pracowników w rankingu.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {employees.map((emp) => (
              <li key={emp.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      emp.active
                        ? "rounded-full border border-border bg-secondary px-2 py-1 text-xs"
                        : "rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                    }
                  >
                    {emp.active ? "Aktywny" : "Nieaktywny"}
                  </span>
                  <Button
                    variant={emp.active ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => (emp.active ? setPending(emp) : toggleMutation.mutate(emp))}
                  >
                    {emp.active ? "Dezaktywuj" : "Aktywuj"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dezaktywować pracownika?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.name} zniknie z publicznego rankingu. Historia ocen i punktów zostanie
              zachowana.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) toggleMutation.mutate(pending);
                setPending(null);
              }}
            >
              Dezaktywuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const CATEGORIES = [
  { key: "productivity", label: "Produktywność" },
  { key: "quality", label: "Jakość pracy" },
  { key: "engagement", label: "Zaangażowanie" },
  { key: "teamwork", label: "Praca zespołowa" },
  { key: "discipline", label: "Dyscyplina" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

function ReviewSection({ employees }: { employees: Employee[] }) {
  const refresh = useRefresh();
  const save = useServerFn(adminSaveReview);
  const [employeeId, setEmployeeId] = useState("");
  const [weekStart, setWeekStart] = useState(currentMonday());
  const [note, setNote] = useState("");
  const [scores, setScores] = useState<Record<CategoryKey, number>>({
    productivity: 0,
    quality: 0,
    engagement: 0,
    teamwork: 0,
    discipline: 0,
  });

  const total = useMemo(
    () => CATEGORIES.reduce((sum, c) => sum + (scores[c.key] || 0), 0),
    [scores],
  );

  const mutation = useMutation({
    mutationFn: () => save({ data: { employeeId, weekStart, note, ...scores } }),
    onSuccess: (res) => {
      toast.success(`Zapisano ocenę: ${res.score}/100`);
      setNote("");
      refresh();
    },
    onError: () => toast.error("Nie udało się zapisać oceny"),
  });

  const activeEmployees = employees.filter((e) => e.active);

  return (
    <form
      className="card-panel max-w-2xl space-y-5 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!employeeId) {
          toast.error("Wybierz pracownika");
          return;
        }
        mutation.mutate();
      }}
    >
      <h2 className="font-display text-lg font-semibold">Ocena tygodniowa</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Pracownik</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz pracownika" />
            </SelectTrigger>
            <SelectContent>
              {activeEmployees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="week">Tydzień (poniedziałek)</Label>
          <Input
            id="week"
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="space-y-2">
            <Label htmlFor={c.key}>{c.label} (0–20)</Label>
            <Input
              id={c.key}
              type="number"
              min={0}
              max={20}
              value={scores[c.key]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(20, Number(e.target.value) || 0));
                setScores((s) => ({ ...s, [c.key]: v }));
              }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Notatka</Label>
        <Textarea
          id="note"
          value={note}
          maxLength={1000}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary px-4 py-3">
        <span className="text-sm text-muted-foreground">Wynik</span>
        <span className="font-display text-xl font-bold">{total}/100</span>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        ZAPISZ OCENĘ
      </Button>
    </form>
  );
}

function MeritSection({ employees }: { employees: Employee[] }) {
  const refresh = useRefresh();
  const add = useServerFn(adminAddMerit);
  const [employeeId, setEmployeeId] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => add({ data: { employeeId, points, reason } }),
    onSuccess: () => {
      toast.success("Przyznano punkty zasługi");
      setPoints(0);
      setReason("");
      refresh();
    },
    onError: () => toast.error("Nie udało się przyznać punktów"),
  });

  return (
    <>
      <form
        className="card-panel max-w-xl space-y-5 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!employeeId) return toast.error("Wybierz pracownika");
          if (points === 0) return toast.error("Podaj liczbę punktów");
          if (reason.trim().length < 3) return toast.error("Podaj powód");
          setConfirm(true);
        }}
      >
        <h2 className="font-display text-lg font-semibold">Dodaj punkty zasługi</h2>
        <div className="space-y-2">
          <Label>Pracownik</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz pracownika" />
            </SelectTrigger>
            <SelectContent>
              {employees
                .filter((e) => e.active)
                .map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Punkty</Label>
          <Input
            id="points"
            type="number"
            min={-100}
            max={100}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Powód</Label>
          <Textarea
            id="reason"
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          PRZYZNAJ PUNKTY
        </Button>
      </form>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Przyznać punkty zasługi?</AlertDialogTitle>
            <AlertDialogDescription>
              {points > 0 ? `+${points}` : points} pkt — {reason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={() => mutation.mutate()}>Przyznaj</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function HistorySection({ employees }: { employees: Employee[] }) {
  const [employeeId, setEmployeeId] = useState("");
  const history = useQuery({
    queryKey: ["admin", "history", employeeId],
    queryFn: () => adminHistory({ data: { id: employeeId } }),
    enabled: Boolean(employeeId),
  });

  return (
    <div className="space-y-6">
      <div className="card-panel max-w-sm space-y-2 p-5">
        <Label>Pracownik</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Wybierz pracownika" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {history.isLoading && (
        <p className="text-sm text-muted-foreground">Ładowanie historii…</p>
      )}

      {history.data && (
        <div className="grid gap-6">
          <div className="card-panel p-5">
            <h3 className="font-display text-base font-semibold">Historia ocen</h3>
            {history.data.reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Brak oceny za bieżący tydzień.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2">Tydzień</th>
                      <th>Wynik</th>
                      <th>Prod.</th>
                      <th>Jakość</th>
                      <th>Zaang.</th>
                      <th>Zespół</th>
                      <th>Dysc.</th>
                      <th>Notatka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.data.reviews.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="py-2">{r.week_start}</td>
                        <td className="font-medium">
                          {r.productivity + r.quality + r.engagement + r.teamwork + r.discipline}
                          /100
                        </td>
                        <td>{r.productivity}</td>
                        <td>{r.quality}</td>
                        <td>{r.engagement}</td>
                        <td>{r.teamwork}</td>
                        <td>{r.discipline}</td>
                        <td className="text-muted-foreground">{r.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-panel p-5">
            <h3 className="font-display text-base font-semibold">Historia punktów zasługi</h3>
            {history.data.merits.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Brak punktów zasługi.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border text-sm">
                {history.data.merits.map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-muted-foreground">
                        {new Date(m.created_at).toLocaleString("pl-PL")}
                      </p>
                      <p>{m.reason}</p>
                    </div>
                    <span className="font-display font-semibold text-primary">
                      {m.points > 0 ? `+${m.points}` : m.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-panel p-5">
            <h3 className="font-display text-base font-semibold">Historia ceny</h3>
            {history.data.priceHistory.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Brak danych.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border text-sm">
                {history.data.priceHistory.map((p) => (
                  <li key={p.weekStart} className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">{p.weekStart}</span>
                    <span>Wynik: {p.score}</span>
                    <span className="font-display font-semibold text-primary">
                      {formatPrice(p.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
