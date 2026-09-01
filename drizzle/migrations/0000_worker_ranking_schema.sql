CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  productivity smallint NOT NULL CHECK (productivity BETWEEN 0 AND 20),
  quality smallint NOT NULL CHECK (quality BETWEEN 0 AND 20),
  engagement smallint NOT NULL CHECK (engagement BETWEEN 0 AND 20),
  teamwork smallint NOT NULL CHECK (teamwork BETWEEN 0 AND 20),
  discipline smallint NOT NULL CHECK (discipline BETWEEN 0 AND 20),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, week_start)
);
CREATE INDEX idx_weekly_reviews_employee ON public.weekly_reviews(employee_id);
CREATE INDEX idx_weekly_reviews_week ON public.weekly_reviews(week_start DESC);
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.merit_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_merit_points_employee ON public.merit_points(employee_id);
GRANT ALL ON public.merit_points TO service_role;
ALTER TABLE public.merit_points ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);
GRANT ALL ON public.admin_sessions TO service_role;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;