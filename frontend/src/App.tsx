import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Droplets,
  FlaskConical,
  LayoutDashboard,
  Map,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'

type HealthResponse = {
  status: string
  app: string
  version: string
  database: {
    status: string
    engine: string
  }
  message?: string
}

type HealthState = 'checking' | 'success' | 'warning'

const plannedDomains: {
  title: string
  description: string
  icon: LucideIcon
  code: string
}[] = [
  {
    title: 'Electricity',
    description: 'Explore energy demand, peak usage, and conservation scenarios.',
    icon: Zap,
    code: 'ENERGY',
  },
  {
    title: 'Water systems',
    description: 'Represent consumption and investigate possible water wastage.',
    icon: Droplets,
    code: 'WATER',
  },
  {
    title: 'Environment',
    description: 'Plan how pollution and environmental indicators could be modelled.',
    icon: Wind,
    code: 'ENVIRONMENT',
  },
  {
    title: 'Crowd management',
    description: 'Explore movement patterns and potential congestion points.',
    icon: Users,
    code: 'MOVEMENT',
  },
  {
    title: 'Time & mobility',
    description: 'Study schedules, travel paths, and avoidable time delays.',
    icon: Clock3,
    code: 'MOBILITY',
  },
  {
    title: 'Campus map',
    description: 'Add spatial context for buildings, routes, and facilities.',
    icon: Map,
    code: 'SPATIAL',
  },
]

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300 text-emerald-950 shadow-sm shadow-emerald-950/10">
        <Building2 size={21} strokeWidth={2.2} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[17px] font-bold leading-5 tracking-tight text-white">Campus OS</p>
        {!compact && (
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-100/55">
            Digital twin workspace
          </p>
        )}
      </div>
    </div>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  disabled = false,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  disabled?: boolean
}) {
  const classes = `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition ${
    active
      ? 'bg-emerald-300 font-semibold text-emerald-950 shadow-sm'
      : disabled
        ? 'cursor-not-allowed text-slate-500'
        : 'text-slate-300 hover:bg-white/8 hover:text-white'
  }`

  if (active) {
    return (
      <a href="#overview" className={classes} aria-current="page">
        <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
        <span className="flex-1">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-950" />
      </a>
    )
  }

  return (
    <div className={classes} aria-disabled={disabled} title={disabled ? 'Planned for a future milestone' : undefined}>
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {disabled && <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">Soon</span>}
    </div>
  )
}

function HealthCard({
  icon: Icon,
  label,
  value,
  detail,
  state,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  state: HealthState
}) {
  const dotClass =
    state === 'success'
      ? 'bg-emerald-500'
      : state === 'checking'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-rose-500'

  const badgeClass =
    state === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : state === 'checking'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-rose-50 text-rose-700'

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          {state === 'checking' ? 'Checking' : state === 'success' ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  )
}

function DomainCard({
  title,
  description,
  icon: Icon,
  code,
}: {
  title: string
  description: string
  icon: LucideIcon
  code: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-slate-900/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
          <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Planned
        </span>
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{code}</p>
      <h3 className="mt-1 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 min-h-[3rem] text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        Model not configured
      </div>
    </article>
  )
}

function RoadmapItem({
  icon: Icon,
  step,
  title,
  detail,
  state,
}: {
  icon: LucideIcon
  step: string
  title: string
  detail: string
  state: 'done' | 'next' | 'planned'
}) {
  const stateLabel = state === 'done' ? 'In place' : state === 'next' ? 'Next milestone' : 'Planned'
  const iconClass = state === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'

  return (
    <div className="flex gap-3.5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${state === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {stateLabel}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Step {step}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8001/api/health', { signal })
      const data = (await response.json()) as HealthResponse
      setHealth(data)
      setLastChecked(new Date())

      if (!response.ok) {
        setError(data.message ?? 'The backend health check returned an error.')
      }
    } catch (err) {
      if (signal?.aborted) return
      setHealth(null)
      setError(err instanceof Error ? err.message : 'Unable to connect to the Campus OS API.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void checkHealth(controller.signal)
    return () => controller.abort()
  }, [checkHealth])

  const backendState: HealthState = loading ? 'checking' : health ? 'success' : 'warning'
  const databaseConnected = health?.database.status === 'connected'
  const databaseState: HealthState = loading ? 'checking' : databaseConnected ? 'success' : 'warning'
  const backendValue = loading ? 'Checking connection' : health ? 'Reachable' : 'Not reachable'
  const databaseValue = loading ? 'Checking connection' : databaseConnected ? 'Connected' : 'Not connected'

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-[258px] shrink-0 flex-col bg-[#10251F] px-5 py-6 lg:flex">
          <a href="#overview" className="mb-10 block rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-emerald-300">
            <BrandMark />
          </a>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <nav aria-label="Main navigation" className="space-y-1.5">
            <SidebarItem icon={LayoutDashboard} label="Overview" active />
            <SidebarItem icon={Map} label="Campus map" disabled />
            <SidebarItem icon={FlaskConical} label="Scenario lab" disabled />
            <SidebarItem icon={Activity} label="Operations" disabled />
          </nav>

          <div className="my-7 border-t border-white/10" />
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Planning domains</p>
          <nav aria-label="Planning domains" className="space-y-1.5">
            <SidebarItem icon={Zap} label="Energy" disabled />
            <SidebarItem icon={Droplets} label="Water" disabled />
            <SidebarItem icon={Wind} label="Environment" disabled />
            <SidebarItem icon={Users} label="Crowd & mobility" disabled />
          </nav>

          <div className="mt-auto pt-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck size={16} aria-hidden="true" />
                <span className="text-xs font-semibold">Foundation build</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">The platform shell is in place. Campus data and simulation models are upcoming milestones.</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Current phase: foundation milestone
              </div>
            </div>
            <p className="mt-5 px-1 text-[10px] text-slate-600">CAMPUS OS · EARLY DEVELOPMENT</p>
          </div>
        </aside>

        <main id="overview" className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-9 lg:py-8">
          <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
            <BrandMark compact />
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">Early build</span>
          </div>

          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">Campus intelligence / Overview</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">Campus overview</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">A workspace for exploring campus operations before changes are made in the real world.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Development build
              </span>
              <button
                type="button"
                onClick={() => void checkHealth()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16352C] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#214A3D] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                Refresh status
              </button>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-[26px] bg-[#15362C] p-6 text-white shadow-lg shadow-emerald-950/10 sm:p-8 lg:p-9" aria-labelledby="hero-title">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/[0.08]" />
            <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full border border-white/[0.08]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                  <Sparkles size={13} aria-hidden="true" />
                  Digital twin platform
                </div>
                <h2 id="hero-title" className="mt-5 max-w-xl text-[30px] font-semibold leading-[1.12] tracking-tight sm:text-[38px]">
                  Plan the change.<br className="hidden sm:block" /> Understand the impact.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-emerald-50/75 sm:text-[15px]">
                  Campus OS aims to help decision-makers compare a baseline with proposed scenarios before acting on campus infrastructure and operations.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#campus-domains" className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-xs font-bold text-emerald-950 transition hover:bg-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    Explore domains <ArrowRight size={15} aria-hidden="true" />
                  </a>
                  <a href="#platform-status" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold text-white/90 transition hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    View platform status <ChevronRight size={15} aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-100/45">Scenario engine · planned, not yet implemented</p>
              </div>

              <div className="relative mx-auto w-full max-w-[360px]" aria-label="Conceptual campus model illustration">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-inner shadow-black/10 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/55">Concept view</p>
                      <p className="mt-1 text-sm font-semibold text-white">Campus model</p>
                    </div>
                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[9px] font-semibold text-emerald-100/70">ILLUSTRATIVE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-dashed border-white/10 bg-[#0D2A21]/60 p-3">
                    <div className="flex h-14 items-center justify-center rounded-lg bg-emerald-200/90 text-[9px] font-bold text-emerald-950">Block A</div>
                    <div className="flex h-14 items-center justify-center rounded-lg bg-emerald-100/75 text-[9px] font-bold text-emerald-950">Library</div>
                    <div className="flex h-14 items-center justify-center rounded-lg bg-emerald-200/70 text-[9px] font-bold text-emerald-950">Labs</div>
                    <div className="flex h-12 items-center justify-center rounded-lg border border-emerald-100/10 bg-white/[0.07] text-[9px] font-semibold text-emerald-50/80">Garden</div>
                    <div className="flex h-12 items-center justify-center rounded-lg bg-[#B9D5A9] text-[9px] font-bold text-emerald-950">Central hub</div>
                    <div className="flex h-12 items-center justify-center rounded-lg border border-emerald-100/10 bg-white/[0.07] text-[9px] font-semibold text-emerald-50/80">Utilities</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] leading-4 text-emerald-50/50">
                    <Map size={13} aria-hidden="true" />
                    Conceptual illustration only — no campus map data connected
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#214A3D] px-3 py-2 shadow-lg sm:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950"><Activity size={14} aria-hidden="true" /></div>
                  <div><p className="text-[10px] font-semibold text-white">Model readiness</p><p className="text-[9px] text-emerald-100/60">Setup in progress</p></div>
                </div>
              </div>
            </div>
          </section>

          <section id="platform-status" className="mt-8 scroll-mt-6" aria-labelledby="status-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="status-heading" className="text-lg font-semibold tracking-tight text-slate-900">Platform status</h2>
                <p className="mt-1 text-xs text-slate-500">Live connectivity checks from your local development environment.</p>
              </div>
              <p className="text-[10px] text-slate-400">{lastChecked ? `Last checked ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for first check'}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <HealthCard
                icon={Activity}
                label="FastAPI backend"
                value={backendValue}
                detail={health ? `Health endpoint responded · ${health.app} v${health.version}` : 'GET /api/health · localhost:8001'}
                state={backendState}
              />
              <HealthCard
                icon={Database}
                label="PostgreSQL database"
                value={databaseValue}
                detail={health?.database.engine ?? 'Database status reported by the backend health endpoint'}
                state={databaseState}
              />
            </div>
            {error && (
              <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <Activity size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div><p className="font-semibold">Health check needs attention</p><p className="mt-1 text-xs leading-5">{error}</p></div>
              </div>
            )}
          </section>

          <section id="campus-domains" className="mt-9 scroll-mt-6" aria-labelledby="domains-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-800">Planned capabilities</p>
                <h2 id="domains-heading" className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Domains for the campus twin</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">These are intended areas of work; data models and simulations are not configured yet.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500"><Clock3 size={12} aria-hidden="true" /> Roadmap</span>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {plannedDomains.map((domain) => <DomainCard key={domain.code} {...domain} />)}
            </div>
          </section>

          <section className="mt-9" aria-labelledby="roadmap-heading">
            <div className="mb-4">
              <h2 id="roadmap-heading" className="text-lg font-semibold tracking-tight text-slate-900">Development path</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">A clear separation between the existing foundation and the next build milestones.</p>
            </div>
            <div className="grid gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] md:grid-cols-3 md:p-6">
              <RoadmapItem
                icon={CheckCircle2}
                step="01"
                title="Platform foundation"
                detail="React/TypeScript dashboard, FastAPI health endpoint, and PostgreSQL connectivity checks."
                state="done"
              />
              <RoadmapItem
                icon={Building2}
                step="02"
                title="Campus data model"
                detail="Define buildings, resources, locations, and validated input datasets."
                state="next"
              />
              <RoadmapItem
                icon={FlaskConical}
                step="03"
                title="Scenario engine"
                detail="Build baseline-versus-alternative simulations and comparison views."
                state="planned"
              />
            </div>
          </section>

          <details className="mt-6 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-900/[0.02]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
              <span className="flex items-center gap-2"><Database size={16} className="text-slate-400" aria-hidden="true" /> Raw API diagnostic response</span>
              <ArrowUpRight size={15} className="text-slate-400" aria-hidden="true" />
            </summary>
            {health ? (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-emerald-200">{JSON.stringify(health, null, 2)}</pre>
            ) : (
              <p className="mt-3 text-xs text-slate-500">No API response is available yet. Start the backend and refresh the status check.</p>
            )}
          </details>

          <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Campus OS · Digital twin and simulation platform</p>
            <p className="inline-flex items-center gap-1.5"><ShieldCheck size={12} aria-hidden="true" /> Local foundation build · no campus operational data connected</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
