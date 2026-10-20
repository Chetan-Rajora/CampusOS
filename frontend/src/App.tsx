import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  ChevronRight,
  Database,
  Droplets,
  FlaskConical,
  Gauge,
  Info,
  LayoutDashboard,
  Leaf,
  Map,
  Menu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type PageId = 'overview' | 'campus-map' | 'scenario-lab' | 'energy' | 'water' | 'environment' | 'crowd-mobility' | 'methodology'
type HealthResponse = {
  status: string
  app?: string
  version?: string
  database?: { status?: string; engine?: string }
  message?: string
}
type HealthState = 'checking' | 'success' | 'error'
type TimeWindow = 'day' | 'week'
type Zone = { id: string; name: string; short: string; kind: string; x: number; y: number; w: number; h: number; detail: string; fill: string }
type DomainKey = 'energy' | 'water' | 'environment' | 'crowd'
type TrendPoint = { label: string; value: number }

const navGroups: { title: string; items: { id: PageId; label: string; icon: LucideIcon; section?: string }[] }[] = [
  { title: 'Workspace', items: [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'campus-map', label: 'Campus map', icon: Map },
    { id: 'scenario-lab', label: 'Scenario lab', icon: FlaskConical },
  ] },
  { title: 'Demo domains', items: [
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'water', label: 'Water', icon: Droplets },
    { id: 'environment', label: 'Environment', icon: Wind },
    { id: 'crowd-mobility', label: 'Crowd & mobility', icon: Users },
  ] },
  { title: 'Guidance', items: [{ id: 'methodology', label: 'Methodology', icon: BookOpen }] },
]

const energyHourly: TrendPoint[] = [
  { label: '08:00', value: 74 }, { label: '09:00', value: 96 }, { label: '10:00', value: 118 },
  { label: '11:00', value: 136 }, { label: '12:00', value: 129 }, { label: '13:00', value: 142 },
  { label: '14:00', value: 132 }, { label: '15:00', value: 115 }, { label: '16:00', value: 91 },
]
const energyWeekly: TrendPoint[] = [
  { label: 'Mon', value: 930 }, { label: 'Tue', value: 985 }, { label: 'Wed', value: 1000 },
  { label: 'Thu', value: 962 }, { label: 'Fri', value: 908 }, { label: 'Sat', value: 610 }, { label: 'Sun', value: 390 },
]
const waterHourly: TrendPoint[] = [
  { label: '08:00', value: 510 }, { label: '09:00', value: 680 }, { label: '10:00', value: 740 },
  { label: '11:00', value: 810 }, { label: '12:00', value: 920 }, { label: '13:00', value: 870 },
  { label: '14:00', value: 790 }, { label: '15:00', value: 710 }, { label: '16:00', value: 590 },
]
const waterWeekly: TrendPoint[] = [
  { label: 'Mon', value: 10800 }, { label: 'Tue', value: 11600 }, { label: 'Wed', value: 12000 },
  { label: 'Thu', value: 11400 }, { label: 'Fri', value: 10900 }, { label: 'Sat', value: 7200 }, { label: 'Sun', value: 4800 },
]
const environmentHourly: TrendPoint[] = [
  { label: '08:00', value: 44 }, { label: '09:00', value: 48 }, { label: '10:00', value: 55 },
  { label: '11:00', value: 61 }, { label: '12:00', value: 63 }, { label: '13:00', value: 59 },
  { label: '14:00', value: 56 }, { label: '15:00', value: 51 }, { label: '16:00', value: 47 },
]
const environmentWeekly: TrendPoint[] = [
  { label: 'Mon', value: 51 }, { label: 'Tue', value: 57 }, { label: 'Wed', value: 62 },
  { label: 'Thu', value: 58 }, { label: 'Fri', value: 54 }, { label: 'Sat', value: 43 }, { label: 'Sun', value: 39 },
]
const crowdHourly: TrendPoint[] = [
  { label: '08:00', value: 90 }, { label: '09:00', value: 180 }, { label: '10:00', value: 245 },
  { label: '11:00', value: 280 }, { label: '12:00', value: 320 }, { label: '13:00', value: 290 },
  { label: '14:00', value: 260 }, { label: '15:00', value: 220 }, { label: '16:00', value: 155 },
]
const crowdWeekly: TrendPoint[] = [
  { label: 'Mon', value: 280 }, { label: 'Tue', value: 305 }, { label: 'Wed', value: 320 },
  { label: 'Thu', value: 296 }, { label: 'Fri', value: 260 }, { label: 'Sat', value: 95 }, { label: 'Sun', value: 30 },
]

const domainConfigs: Record<DomainKey, {
  title: string; eyebrow: string; icon: LucideIcon; description: string; headline: string; headlineValue: string; unit: string
  hourly: TrendPoint[]; weekly: TrendPoint[]; insightTitle: string; insight: string; note: string
}> = {
  energy: {
    title: 'Energy operations', eyebrow: 'ENERGY', icon: Zap,
    description: 'Explore an illustrative demand profile and test a transparent consumption-reduction assumption.',
    headline: 'Example daily baseline', headlineValue: '1,000', unit: 'kWh/day', hourly: energyHourly, weekly: energyWeekly,
    insightTitle: 'Illustrative observation', insight: 'The sample profile rises around midday. This is a demo pattern, not measured campus behaviour.',
    note: 'All values on this panel are synthetic demo values. They are not GL Bajaj meter readings.',
  },
  water: {
    title: 'Water systems', eyebrow: 'WATER', icon: Droplets,
    description: 'Inspect an illustrative water-use profile and explore a simple percentage-change scenario.',
    headline: 'Example daily baseline', headlineValue: '12,000', unit: 'L/day', hourly: waterHourly, weekly: waterWeekly,
    insightTitle: 'Illustrative observation', insight: 'The example contains a midday use peak. Real demand patterns require validated meter records.',
    note: 'All values on this panel are synthetic demo values. They are not GL Bajaj water-meter readings.',
  },
  environment: {
    title: 'Environment', eyebrow: 'ENVIRONMENT', icon: Wind,
    description: 'View a clearly labelled demo environmental indicator profile without implying a real air-quality feed.',
    headline: 'Example indicator', headlineValue: '62', unit: 'unitless demo score', hourly: environmentHourly, weekly: environmentWeekly,
    insightTitle: 'Interpretation note', insight: 'This arbitrary score only demonstrates a time-series view. It is not AQI, PM2.5, or an official measurement.',
    note: 'No live sensor or CPCB station feed is connected. Replace the demo series with identified and cited measurements before using it operationally.',
  },
  crowd: {
    title: 'Crowd & mobility', eyebrow: 'CROWD / MOBILITY', icon: Users,
    description: 'Review an illustrative occupancy-count profile. No person-level tracking or campus footfall data is connected.',
    headline: 'Example peak count', headlineValue: '320', unit: 'people (demo)', hourly: crowdHourly, weekly: crowdWeekly,
    insightTitle: 'Planning possibility', insight: 'Aggregated counts can help flag busy periods; density needs valid usable-area measurements.',
    note: 'Counts are synthetic and for UI demonstration only. They are not actual campus footfall or live occupancy.',
  },
}

const zones: Zone[] = [
  { id: 'gate', name: 'Main entrance', short: 'MAIN GATE', kind: 'Access', x: 28, y: 180, w: 102, h: 62, detail: 'Conceptual entry point for demonstrating access and movement layers.', fill: '#BFE9D5' },
  { id: 'block-a', name: 'Academic Block A', short: 'BLOCK A', kind: 'Academic', x: 160, y: 64, w: 150, h: 88, detail: 'Example academic building zone. No real building footprint or capacity is encoded.', fill: '#8FDDBB' },
  { id: 'library', name: 'Library', short: 'LIBRARY', kind: 'Learning', x: 362, y: 55, w: 136, h: 82, detail: 'Example learning-space zone for future schedule and occupancy data.', fill: '#B8DDCC' },
  { id: 'labs', name: 'Laboratories', short: 'LABS', kind: 'Academic', x: 548, y: 78, w: 145, h: 90, detail: 'Example laboratory zone. Energy and operating-hour models are not connected.', fill: '#76C7A7' },
  { id: 'admin', name: 'Administration', short: 'ADMIN', kind: 'Operations', x: 164, y: 284, w: 132, h: 70, detail: 'Example administration zone for a future asset and facilities registry.', fill: '#D4E6D8' },
  { id: 'hub', name: 'Central courtyard', short: 'CENTRAL HUB', kind: 'Open space', x: 346, y: 185, w: 160, h: 95, detail: 'Illustrative shared outdoor space. Geometry is conceptual, not surveyed.', fill: '#B4D6A1' },
  { id: 'canteen', name: 'Food court', short: 'FOOD COURT', kind: 'Facility', x: 555, y: 286, w: 128, h: 68, detail: 'Example facility where aggregated time-based footfall could be analysed.', fill: '#F0D8A8' },
  { id: 'garden', name: 'Green zone', short: 'GREEN ZONE', kind: 'Green space', x: 370, y: 328, w: 118, h: 48, detail: 'Illustrative green zone for future environmental or landscape data.', fill: '#B5DAB1' },
]

function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(' ') }
function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value)
}
function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300 text-emerald-950"><Building2 size={21} strokeWidth={2.2} aria-hidden="true" /></div><div className="min-w-0"><p className="text-[17px] font-bold leading-5 tracking-tight text-white">Campus OS</p>{!compact && <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-100/55">Digital twin workspace</p>}</div></div>
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  const tones = { neutral: 'border-slate-200 bg-slate-50 text-slate-500', green: 'border-emerald-200 bg-emerald-50 text-emerald-800', amber: 'border-amber-200 bg-amber-50 text-amber-800', red: 'border-rose-200 bg-rose-50 text-rose-700', blue: 'border-sky-200 bg-sky-50 text-sky-700' }
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.09em]', tones[tone])}>{children}</span>
}

function SectionHeading({ eyebrow, title, description, right }: { eyebrow?: string; title: string; description?: string; right?: ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-emerald-800">{eyebrow}</p>}<h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{title}</h2>{description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{right && <div className="shrink-0">{right}</div>}</div>
}

function MetricCard({ icon: Icon, label, value, unit, detail, tone = 'green', onClick }: { icon: LucideIcon; label: string; value: string; unit?: string; detail: string; tone?: 'green' | 'blue' | 'amber' | 'slate'; onClick?: () => void }) {
  const iconTones = { green: 'bg-emerald-50 text-emerald-800', blue: 'bg-sky-50 text-sky-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-100 text-slate-600' }
  const content = <><div className="flex items-start justify-between gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconTones[tone])}><Icon size={19} aria-hidden="true" /></div><Badge tone="amber">Demo</Badge></div><p className="mt-4 text-xs font-medium text-slate-500">{label}</p><p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-2xl font-semibold tracking-tight text-slate-950">{value}<span className="text-xs font-medium text-slate-500">{unit}</span></p><p className="mt-2 text-[11px] leading-5 text-slate-500">{detail}</p></>
  if (onClick) return <button type="button" onClick={onClick} className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:p-5">{content}</button>
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">{content}</article>
}

function HealthCard({ icon: Icon, label, value, detail, state }: { icon: LucideIcon; label: string; value: string; detail: string; state: HealthState }) {
  const tone = state === 'success' ? 'green' : state === 'checking' ? 'amber' : 'red'
  const iconTone = state === 'success' ? 'text-emerald-800 bg-emerald-50' : state === 'checking' ? 'text-amber-800 bg-amber-50' : 'text-rose-700 bg-rose-50'
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconTone)}><Icon size={19} aria-hidden="true" /></div><Badge tone={tone}>{state === 'checking' ? 'Checking' : state === 'success' ? 'Available' : 'Unavailable'}</Badge></div><p className="mt-4 text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-2 break-words text-[11px] leading-5 text-slate-500">{detail}</p></article>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number; name?: string; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg"><p className="mb-1 text-[11px] font-semibold text-slate-500">{label}</p>{payload.map((item, index) => <p key={`${item.name ?? 'metric'}-${index}`} className="text-xs font-semibold text-slate-800" style={{ color: item.color }}>{item.name}: {typeof item.value === 'number' ? formatNumber(item.value, 1) : item.value}</p>)}</div>
}

function DemoNotice({ children = 'Illustrative demo values only — no live campus sensors or operational dataset are connected.' }: { children?: ReactNode }) {
  return <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] leading-5 text-amber-900"><Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><p>{children}</p></div>
}

function TrendChart({ data, color = '#14805E', label = 'Illustrative metric', unit = '', windowLabel = 'Time' }: { data: TrendPoint[]; color?: string; label?: string; unit?: string; windowLabel?: string }) {
  return <div className="h-[250px] w-full" role="img" aria-label={`${label} trend chart using illustrative demo data`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2} /><stop offset="95%" stopColor={color} stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#E8EEEB" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#81918A', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis tick={{ fill: '#81918A', fontSize: 10 }} tickLine={false} axisLine={false} width={48} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="value" name={label} stroke={color} strokeWidth={2.5} fill="url(#trendFill)" activeDot={{ r: 4, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer><p className="sr-only">Horizontal axis: {windowLabel}. Values are demo data and units are {unit || 'domain-specific'}.</p></div>
}

function InteractiveCampusMap({ onSelectDomain }: { onSelectDomain: (page: PageId) => void }) {
  const [selectedZone, setSelectedZone] = useState('hub')
  const gateZone = zones[0]!
  const selected = zones.find(zone => zone.id === selectedZone) ?? gateZone
  const activate = (zone: Zone) => setSelectedZone(zone.id)
  const handleKey = (event: KeyboardEvent<SVGGElement>, zone: Zone) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(zone) } }
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.65fr)]"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F7FAF7] p-2 sm:p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-2"><Badge tone="amber">Illustrative · not geographic</Badge><span className="text-[10px] font-medium text-slate-400">Click or keyboard-select a zone</span></div><svg viewBox="0 0 730 430" className="h-auto w-full" aria-label="Clickable conceptual campus map; building positions and sizes are illustrative, not real geographic data." role="group"><rect x="9" y="9" width="712" height="412" rx="22" fill="#EDF4EE" stroke="#D8E5DB" strokeWidth="2" /><path d="M18 212 H712 M332 18 V412 M525 18 V412" stroke="#D5DED8" strokeWidth="36" strokeLinecap="round" /><path d="M18 212 H712 M332 18 V412 M525 18 V412" stroke="#FFFFFF" strokeWidth="27" strokeLinecap="round" /><path d="M18 212 H712 M332 18 V412 M525 18 V412" stroke="#D6DFD8" strokeWidth="1.4" strokeDasharray="8 8" /><path d="M111 155 C150 180 146 246 172 276 M492 142 C525 160 532 250 565 272 M310 112 C325 140 356 162 374 185" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" /><rect x="20" y="187" width="18" height="50" rx="4" fill="#174D3C"/><text x="49" y="174" fontSize="10" fontWeight="700" fill="#567269">ENTRY</text><g transform="translate(675 26)"><path d="M0 22 L9 0 L18 22 Z" fill="#1E5C46"/><text x="9" y="35" textAnchor="middle" fontSize="10" fontWeight="700" fill="#345E4E">N</text></g>{zones.filter(zone => zone.id !== 'gate').map(zone => <g key={zone.id} role="button" tabIndex={0} aria-label={`Select ${zone.name}`} aria-pressed={selectedZone === zone.id} onClick={() => activate(zone)} onKeyDown={(event: KeyboardEvent<SVGGElement>) => handleKey(event, zone)} style={{ cursor: 'pointer', outline: 'none' }}><rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="10" fill={selectedZone === zone.id ? '#51DDB1' : zone.fill} stroke={selectedZone === zone.id ? '#0A684B' : '#A7CABB'} strokeWidth={selectedZone === zone.id ? 3 : 1.2} /><text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 - 2} textAnchor="middle" fontSize="12" fontWeight="700" fill="#174638">{zone.short}</text><text x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 14} textAnchor="middle" fontSize="8" fontWeight="600" fill="#477262">{zone.kind.toUpperCase()}</text></g>)}<g role="button" tabIndex={0} aria-label="Select main entrance" aria-pressed={selectedZone === 'gate'} onClick={() => activate(gateZone)} onKeyDown={(event: KeyboardEvent<SVGGElement>) => handleKey(event, gateZone)} style={{ cursor: 'pointer', outline: 'none' }}><rect x="28" y="180" width="102" height="62" rx="10" fill={selectedZone === 'gate' ? '#51DDB1' : gateZone.fill} stroke={selectedZone === 'gate' ? '#0A684B' : '#A7CABB'} strokeWidth={selectedZone === 'gate' ? 3 : 1.2} /><text x="79" y="206" textAnchor="middle" fontSize="10" fontWeight="700" fill="#174638">MAIN GATE</text><text x="79" y="220" textAnchor="middle" fontSize="8" fontWeight="600" fill="#477262">ACCESS</text></g><text x="46" y="401" fontSize="9" fill="#74877D">CONCEPTUAL LAYOUT · NOT TO SCALE</text></svg></div><aside className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Selected zone</p><Badge tone="green">Demo object</Badge></div><h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{selected.name}</h3><p className="mt-1 text-xs font-medium text-emerald-800">{selected.kind} zone</p><p className="mt-4 text-sm leading-6 text-slate-500">{selected.detail}</p><div className="mt-5 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Data readiness</p><p className="mt-1 text-sm font-semibold text-slate-800">No geographic data linked</p><p className="mt-1 text-xs leading-5 text-slate-500">Shapes are hand-drawn for interaction only. Replace them with a verified site plan or GeoJSON before location-based analysis.</p></div><div className="mt-auto pt-5"><button type="button" onClick={() => onSelectDomain('scenario-lab')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16352C] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#214A3D]">Explore a scenario <ArrowRight size={14} /></button></div></aside></div>
}

function OverviewPage({ health, healthState, databaseState, backendValue, databaseValue, checkHealth, loading, error, onNavigate }: { health: HealthResponse | null; healthState: HealthState; databaseState: HealthState; backendValue: string; databaseValue: string; checkHealth: () => void; loading: boolean; error: string; onNavigate: (page: PageId) => void }) {
  const energyComparison = useMemo(() => energyWeekly.map(point => ({ ...point, proposed: Math.round(point.value * 0.85) })), [])
  return <><section className="relative overflow-hidden rounded-[26px] bg-[#15362C] p-6 text-white shadow-lg shadow-emerald-950/10 sm:p-8 lg:p-9"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/[0.08]"/><div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]"><div><Badge tone="green"><Sparkles size={12}/> Digital twin workspace</Badge><h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-[38px]">Plan the change.<br className="hidden sm:block"/>Understand the impact.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-emerald-50/75 sm:text-[15px]">Campus OS is a prototype workspace for exploring campus operations and comparing transparent what-if assumptions before real-world action.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate('campus-map')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-xs font-bold text-emerald-950 transition hover:bg-emerald-200">Explore conceptual map <ArrowRight size={15}/></button><button type="button" onClick={() => onNavigate('scenario-lab')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold text-white/90 transition hover:bg-white/[0.07]">Open scenario lab <ChevronRight size={15}/></button></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-100/60">Demo data labelled · scenario engine is deterministic and illustrative</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/60">Example profile</p><p className="mt-1 text-sm font-semibold text-white">Weekly electricity baseline</p></div><Badge tone="amber">Synthetic data</Badge></div><div className="h-[205px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={energyComparison} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}><defs><linearGradient id="overviewEnergyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#62E0B7" stopOpacity={0.45}/><stop offset="95%" stopColor="#62E0B7" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" tick={{ fill: '#C5DDD2', fontSize: 10 }} tickLine={false} axisLine={false}/><YAxis tick={{ fill: '#C5DDD2', fontSize: 9 }} tickLine={false} axisLine={false} width={42}/><Tooltip content={<ChartTooltip/>}/><Area type="monotone" dataKey="value" name="Baseline (demo)" stroke="#9EE9D1" fill="url(#overviewEnergyFill)" strokeWidth={2.4}/><Area type="monotone" dataKey="proposed" name="15% lower assumption" stroke="#F3DDA8" strokeWidth={2} fill="none" activeDot={false}/></AreaChart></ResponsiveContainer></div><p className="mt-2 text-[10px] leading-4 text-emerald-50/60">Illustrative comparison for UI demonstration; not measured savings.</p></div></div></section><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={Zap} label="Energy baseline" value="1,000" unit="kWh/day" detail="Example input for scenario testing" onClick={() => onNavigate('energy')}/><MetricCard icon={Droplets} label="Water baseline" value="12,000" unit="L/day" detail="Example input for scenario testing" tone="blue" onClick={() => onNavigate('water')}/><MetricCard icon={Users} label="Peak occupancy" value="320" unit="people" detail="Synthetic count, not live footfall" tone="amber" onClick={() => onNavigate('crowd-mobility')}/><MetricCard icon={Leaf} label="Environment score" value="62" unit="demo score" detail="Unitless example, not official AQI" tone="slate" onClick={() => onNavigate('environment')}/></div><section id="platform-status" className="mt-8 scroll-mt-6"><SectionHeading eyebrow="System health" title="Platform status" description="Live connectivity checks from your local development environment." right={<button type="button" onClick={checkHealth} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#16352C] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#214A3D] disabled:opacity-60"><RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>Refresh status</button>}/><div className="grid gap-3 sm:grid-cols-2"><HealthCard icon={Activity} label="FastAPI backend" value={backendValue} detail={health ? `Health endpoint responded · ${health.app ?? 'Campus OS'} ${health.version ? `v${health.version}` : ''}` : 'GET /api/health · localhost:8001'} state={healthState}/><HealthCard icon={Database} label="PostgreSQL database" value={databaseValue} detail={health?.database?.engine ?? 'Database status reported by the backend health endpoint'} state={databaseState}/></div>{error && <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800"><Info size={15} className="mt-0.5 shrink-0"/>{error}</div>}</section><section className="mt-9"><SectionHeading eyebrow="At a glance" title="Explore the demo workspace" description="Every domain panel is interactive; all sample numbers are clearly marked as illustrative."/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{([{id:'energy',label:'Energy',icon:Zap,detail:'Example consumption profile'},{id:'water',label:'Water',icon:Droplets,detail:'Example resource profile'},{id:'environment',label:'Environment',icon:Wind,detail:'Synthetic indicator trend'},{id:'crowd-mobility',label:'Crowd & mobility',icon:Users,detail:'Illustrative occupancy counts'}] as {id:PageId;label:string;icon:LucideIcon;detail:string}[]).map(card => <button key={card.id} type="button" onClick={() => onNavigate(card.id)} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><card.icon size={19}/></span><span><span className="block text-sm font-semibold text-slate-900">{card.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{card.detail}</span><span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">Open panel <ArrowUpRight size={12}/></span></span></button>)}</div></section></>
}

function CampusMapPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return <><SectionHeading eyebrow="Spatial workspace" title="Campus map" description="Select a zone to explore its concept details. This diagram is illustrative, not a real GL Bajaj map, survey, or georeferenced plan." right={<Badge tone="amber">Geographic data not connected</Badge>}/><DemoNotice>Zone positions, names, shapes and sizes are sample design objects. No real campus boundaries, coordinates, road routes or building footprints are encoded here.</DemoNotice><div className="mt-4"><InteractiveCampusMap onSelectDomain={onNavigate}/></div><div className="mt-5 grid gap-3 md:grid-cols-3"><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-800">Next data required</p><p className="mt-1 text-xs leading-5 text-slate-500">Official site plan, verified building labels, and either coordinates or a scaled drawing.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-800">Future spatial format</p><p className="mt-1 text-xs leading-5 text-slate-500">GeoJSON features can represent verified zones and buildings once geometry is available.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-800">Current limitation</p><p className="mt-1 text-xs leading-5 text-slate-500">The diagram supports UI interaction, not navigation, distance, route time, or geospatial analysis.</p></article></div></>
}

function ScenarioLabPage() {
  const [domain, setDomain] = useState<'energy' | 'water'>('energy')
  const [baselineText, setBaselineText] = useState('1000')
  const [reduction, setReduction] = useState(15)
  const baseline = Number.isFinite(Number(baselineText)) ? Math.max(0, Number(baselineText)) : 0
  const proposed = baseline * (1 - reduction / 100)
  const difference = proposed - baseline
  const unit = domain === 'energy' ? 'kWh/day' : 'L/day'
  const chartData = [{ label: 'Baseline', value: baseline }, { label: 'Proposed', value: proposed }]
  const setDomainAndBaseline = (nextDomain: 'energy' | 'water') => { setDomain(nextDomain); setBaselineText(nextDomain === 'energy' ? '1000' : '12000') }
  const reset = () => { setDomainAndBaseline('energy'); setReduction(15) }
  return <><SectionHeading eyebrow="What-if modelling" title="Scenario lab" description="Change the demo baseline and reduction assumption to see an immediate, deterministic comparison." right={<Badge tone="amber">Illustrative calculation</Badge>}/><DemoNotice>This is a transparent arithmetic demo, not a calibrated simulation of campus equipment or a prediction of actual savings. The default 1,000 kWh/day and 15% reduction are example inputs only.</DemoNotice><div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-semibold text-slate-900">Scenario inputs</h3><button type="button" onClick={reset} className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">Reset example</button></div><div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button type="button" aria-pressed={domain === 'energy'} onClick={() => setDomainAndBaseline('energy')} className={cn('flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition', domain === 'energy' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}><Zap size={15}/>Electricity</button><button type="button" aria-pressed={domain === 'water'} onClick={() => setDomainAndBaseline('water')} className={cn('flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition', domain === 'water' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}><Droplets size={15}/>Water</button></div><label htmlFor="baseline-input" className="mt-5 block text-xs font-semibold text-slate-700">Baseline consumption ({unit})</label><input id="baseline-input" type="number" inputMode="decimal" min="0" step={domain === 'energy' ? '50' : '500'} value={baselineText} onChange={(event: ChangeEvent<HTMLInputElement>) => setBaselineText(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"/><div className="mt-5 flex items-center justify-between gap-3"><label htmlFor="reduction-slider" className="text-xs font-semibold text-slate-700">Assumed reduction</label><span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-800">{reduction}%</span></div><input id="reduction-slider" type="range" min="0" max="40" step="1" value={reduction} onChange={(event: ChangeEvent<HTMLInputElement>) => setReduction(Number(event.target.value))} className="mt-3 w-full accent-emerald-700"/><div className="flex justify-between text-[10px] text-slate-400"><span>0%</span><span>20%</span><span>40%</span></div><div className="mt-5 rounded-xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Formula</p><code className="mt-2 block whitespace-normal text-xs leading-6 text-slate-700">Proposed = Baseline × (1 − Reduction / 100)</code><code className="block whitespace-normal text-xs leading-6 text-slate-700">Difference = Proposed − Baseline</code></div><p className="mt-4 text-[11px] leading-5 text-slate-500">The formula applies the selected percentage directly to the example input. It does not model weather, occupancy, equipment, operating schedules or physical constraints.</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-800">Live local calculation</p><h3 className="mt-1 text-base font-semibold text-slate-900">Baseline vs proposed</h3></div><Badge tone="green">Deterministic</Badge></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-200 p-4"><p className="text-[11px] font-medium text-slate-500">Baseline</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{formatNumber(baseline, 2)}</p><p className="mt-1 text-[10px] text-slate-500">{unit}</p></div><div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"><p className="text-[11px] font-medium text-emerald-800">Proposed</p><p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-950">{formatNumber(proposed, 2)}</p><p className="mt-1 text-[10px] text-emerald-800">{unit}</p></div></div><div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#15362C] p-4 text-white"><div><p className="text-[11px] text-emerald-100/70">Calculated difference</p><p className="mt-1 text-xl font-semibold">{difference > 0 ? '+' : ''}{formatNumber(difference, 2)} {unit}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300 text-emerald-950">{difference <= 0 ? <ArrowDownRight size={22}/> : <ArrowUpRight size={22}/>}</div></div><div className="mt-5 h-[230px] w-full" role="img" aria-label="Baseline and proposed demo values"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><CartesianGrid stroke="#E8EEEB" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" tick={{ fill: '#697A72', fontSize: 11 }} tickLine={false} axisLine={false}/><YAxis tick={{ fill: '#81918A', fontSize: 10 }} tickLine={false} axisLine={false} width={58}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="value" name={unit} fill="#14805E" radius={[7,7,0,0]} maxBarSize={74}/></BarChart></ResponsiveContainer></div><p className="mt-2 text-[10px] leading-5 text-slate-400">Estimated result under the stated assumption only. No real savings are claimed.</p></section></div><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><SectionHeading title="Scenario logic" description="A reproducible one-parameter calculation is a useful first prototype before adding equipment-level or calibrated models."/><div className="grid gap-4 md:grid-cols-3"><div><p className="text-xs font-semibold text-slate-800">1 · Input</p><p className="mt-1 text-xs leading-5 text-slate-500">User-selected baseline quantity and percentage reduction.</p></div><div><p className="text-xs font-semibold text-slate-800">2 · Calculation</p><p className="mt-1 text-xs leading-5 text-slate-500">Multiply baseline by one minus the reduction fraction.</p></div><div><p className="text-xs font-semibold text-slate-800">3 · Comparison</p><p className="mt-1 text-xs leading-5 text-slate-500">Show baseline, proposed value, absolute difference, and units.</p></div></div></section></>
}

function DomainPage({ domain }: { domain: DomainKey }) {
  const config = domainConfigs[domain]
  const Icon = config.icon
  const [window, setWindow] = useState<TimeWindow>('day')
  const data = window === 'day' ? config.hourly : config.weekly
  const peak = Math.max(...data.map(point => point.value))
  const average = data.reduce((sum, point) => sum + point.value, 0) / data.length
  const isCount = domain === 'crowd'
  return <><SectionHeading eyebrow={config.eyebrow} title={config.title} description={config.description} right={<Badge tone="amber">Demo panel</Badge>}/><DemoNotice>{config.note}</DemoNotice><div className="mt-4 grid gap-3 md:grid-cols-3"><MetricCard icon={Icon} label={config.headline} value={config.headlineValue} unit={config.unit} detail="Synthetic display value, not a live measurement"/><MetricCard icon={Gauge} label={window === 'day' ? 'Demo peak (hourly series)' : 'Demo peak (weekly series)'} value={formatNumber(peak)} unit={domain === 'energy' ? (window === 'day' ? 'kWh / interval' : 'kWh / day') : domain === 'water' ? (window === 'day' ? 'L / interval' : 'L / day') : isCount ? 'people' : 'score'} detail="Highest value in the displayed illustrative series" tone="blue"/><MetricCard icon={Activity} label="Demo mean" value={formatNumber(average, 1)} unit="per data point" detail="Arithmetic mean of visible demo values" tone="slate"/></div><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">Illustrative trend</h3><p className="mt-1 text-xs text-slate-500">The period switch changes which sample series is displayed.</p></div><div className="flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setWindow('day')} aria-pressed={window === 'day'} className={cn('rounded-lg px-3 py-2 text-xs font-semibold transition', window === 'day' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500')}>Intraday</button><button type="button" onClick={() => setWindow('week')} aria-pressed={window === 'week'} className={cn('rounded-lg px-3 py-2 text-xs font-semibold transition', window === 'week' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500')}>Weekly</button></div></div><div className="mt-4"><TrendChart data={data} label={config.title} color={domain === 'environment' ? '#9B7B32' : domain === 'water' ? '#2686A6' : domain === 'crowd' ? '#7C6BC2' : '#14805E'} unit={config.unit} windowLabel={window === 'day' ? 'Hour' : 'Day'}/></div><div className="mt-3 border-t border-slate-100 pt-4"><p className="text-xs font-semibold text-slate-800">{config.insightTitle}</p><p className="mt-1 text-xs leading-5 text-slate-500">{config.insight}</p></div></section><section className="mt-5 grid gap-3 md:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-semibold text-slate-900">What a real dataset would add</h3><p className="mt-2 text-xs leading-5 text-slate-500">Timestamp, asset/zone ID, measured value, units, data source, quality flag, and coverage metadata. Domain-specific readings must be approved and validated before analysis.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-semibold text-slate-900">Next analysis milestone</h3><p className="mt-2 text-xs leading-5 text-slate-500">Connect a verified dataset, build a transparent baseline, then compare it with a scenario and validate against observations when available.</p></article></section></>
}

function MethodologyPage() {
  const steps = [
    { n: '01', title: 'Ingest & preserve provenance', detail: 'Read CSV/XLSX observations or verified spatial files. Record the source, collection time, units, licence and whether values are measured, public, assumed or synthetic.' },
    { n: '02', title: 'Validate and clean', detail: 'Check required fields, timestamps, units, duplicates, impossible values and foreign keys to known assets. Flag errors and missingness instead of silently deleting or replacing records.' },
    { n: '03', title: 'Build a baseline', detail: 'Aggregate observations by time and asset. Start with observed summaries or comparable time-of-week medians; only forecast when enough historical data supports evaluation.' },
    { n: '04', title: 'Apply a deterministic scenario', detail: 'Change an explicit parameter, run the stated formula, preserve units and assumptions, and calculate the baseline-to-proposal difference.' },
    { n: '05', title: 'Compare and validate', detail: 'Report absolute and percentage differences. If predictive modelling is added, test on a later time period and report MAE/RMSE or another suitable metric.' },
  ]
  return <><SectionHeading eyebrow="Technical guide" title="Methodology & assumptions" description="The steps below describe the proposed model workflow and the simple scenario calculation currently implemented in this demo UI." right={<Badge tone="blue">Transparent methods</Badge>}/><div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]"><section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-base font-semibold text-slate-900">Proposed campus-data workflow</h3><div className="mt-5 space-y-5">{steps.map((step, index) => <div key={step.n} className="relative flex gap-3.5">{index < steps.length - 1 && <div className="absolute left-[17px] top-10 h-[calc(100%+4px)] border-l border-dashed border-emerald-200"/>}<span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[11px] font-bold text-emerald-800">{step.n}</span><div><h4 className="text-sm font-semibold text-slate-900">{step.title}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p></div></div>)}</div></section><section className="space-y-3"><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">Implemented in this frontend</p><h3 className="mt-2 text-base font-semibold text-slate-900">Deterministic percentage scenario</h3><code className="mt-3 block rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-800">proposed = baseline × (1 − r/100)<br/>difference = proposed − baseline</code><p className="mt-3 text-xs leading-5 text-slate-500">For baseline 1,000 and r = 15, the UI calculates 850 proposed units and a −150-unit difference. This is arithmetic, not a calibrated energy model.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">Data-quality policy</p><h3 className="mt-2 text-sm font-semibold text-slate-900">Missing values stay visible</h3><p className="mt-2 text-xs leading-5 text-slate-500">Do not replace missing consumption with zero by default. Preserve missing flags; interpolate only short gaps if justified, and keep long gaps excluded or clearly flagged.</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">Future evaluation</p><h3 className="mt-2 text-sm font-semibold text-slate-900">Compare with observed outcomes</h3><p className="mt-2 text-xs leading-5 text-slate-500">Use a time-based holdout for forecasts, report MAE/RMSE, and validate proposed scenario assumptions with approved campus observations before asserting benefits.</p></article></section></div><section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><SectionHeading title="Data schema to implement" description="These are proposed tables/fields, not a claim that they are already present in PostgreSQL."/><div className="overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-[0.1em] text-slate-400"><th className="px-3 py-3">Dataset</th><th className="px-3 py-3">Core fields</th><th className="px-3 py-3">Purpose</th></tr></thead><tbody className="divide-y divide-slate-100">{[{name:'campus_assets',fields:'asset_id, name, type, zone, geometry',purpose:'Represent buildings, zones, and facilities'},{name:'observations',fields:'timestamp, asset_id, metric, value, unit, source, quality_flag',purpose:'Store measured or clearly tagged demo readings'},{name:'schedules',fields:'space_id, starts_at, ends_at, event_type, capacity',purpose:'Analyse time and space use'},{name:'scenario_results',fields:'scenario_id, baseline, proposed, difference, assumptions',purpose:'Reproduce comparisons and explain outputs'}].map(row => <tr key={row.name}><td className="px-3 py-3 font-semibold text-slate-800">{row.name}</td><td className="px-3 py-3 font-mono text-[10px] leading-5 text-slate-600">{row.fields}</td><td className="px-3 py-3 text-slate-500">{row.purpose}</td></tr>)}</tbody></table></div></section><DemoNotice>All domain trends and KPI example values are synthetic UI samples. The app does not read campus meter data, air-quality sensors, occupancy systems, or a geographic campus dataset.</DemoNotice></>
}

function Sidebar({ active, onNavigate, mobileOpen, setMobileOpen }: { active: PageId; onNavigate: (page: PageId) => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const navContent = <>{navGroups.map(group => <div key={group.title} className="mb-6"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{group.title}</p><nav aria-label={group.title} className="space-y-1">{group.items.map(item => { const Icon = item.icon; const selected = active === item.id; return <button key={item.id} type="button" onClick={() => { onNavigate(item.id); setMobileOpen(false) }} aria-current={selected ? 'page' : undefined} className={cn('flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300', selected ? 'bg-emerald-300 font-semibold text-emerald-950 shadow-sm' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white')}><Icon size={18} strokeWidth={1.9} aria-hidden="true"/><span className="flex-1">{item.label}</span>{selected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-950"/>}</button> })}</nav></div>)}</>
  return <><aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col bg-[#10251F] px-5 py-6 lg:flex"><button type="button" onClick={() => onNavigate('overview')} className="mb-9 block rounded-xl text-left outline-offset-4 focus-visible:outline focus-visible:outline-emerald-300"><BrandMark/></button><div className="flex-1 overflow-y-auto">{navContent}</div><div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center gap-2 text-emerald-200"><ShieldCheck size={15}/><span className="text-xs font-semibold">Presentation demo</span></div><p className="mt-2 text-[11px] leading-5 text-slate-400">Scenario outputs and map shapes are illustrative. Backend health is checked separately.</p><p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">CAMPUS OS · EARLY DEVELOPMENT</p></div></aside>{mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close navigation backdrop" className="absolute inset-0 bg-slate-950/45" onClick={() => setMobileOpen(false)}/><aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col overflow-y-auto bg-[#10251F] px-5 py-6 shadow-2xl"><div className="mb-8 flex items-center justify-between"><button type="button" onClick={() => { onNavigate('overview'); setMobileOpen(false) }}><BrandMark/></button><button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-white hover:bg-white/10"><X size={20}/></button></div>{navContent}</aside></div>}</>
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loadingHealth, setLoadingHealth] = useState(true)
  const [healthError, setHealthError] = useState('')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = useCallback(async (signal?: AbortSignal) => {
    setLoadingHealth(true)
    setHealthError('')
    try {
      const response = await fetch('http://localhost:8001/api/health', { signal })
      const data = await response.json() as HealthResponse
      if (!response.ok) throw new Error(data.message ?? `Health endpoint returned HTTP ${response.status}`)
      setHealth(data)
      setLastChecked(new Date())
    } catch (error) {
      if (signal?.aborted) return
      setHealth(null)
      setHealthError(error instanceof Error ? error.message : 'Unable to reach the Campus OS API.')
    } finally {
      if (!signal?.aborted) setLoadingHealth(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void checkHealth(controller.signal)
    return () => controller.abort()
  }, [checkHealth])

  useEffect(() => {
    document.title = `${navGroups.flatMap(group => group.items).find(item => item.id === activePage)?.label ?? 'Campus OS'} · Campus OS`
  }, [activePage])

  const pageInfo = navGroups.flatMap(group => group.items).find(item => item.id === activePage)
  const pageTitle = pageInfo?.label ?? 'Overview'
  const backendOK = !!health && health.status === 'ok'
  const databaseOK = health?.database?.status === 'connected'
  const healthState: HealthState = loadingHealth ? 'checking' : backendOK ? 'success' : 'error'
  const databaseState: HealthState = loadingHealth ? 'checking' : databaseOK ? 'success' : 'error'
  const backendValue = loadingHealth ? 'Checking connection' : backendOK ? 'Reachable' : 'Not reachable'
  const databaseValue = loadingHealth ? 'Checking connection' : databaseOK ? 'Connected' : 'Not connected'

  const navigate = (page: PageId) => {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageContent = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage health={health} healthState={healthState} databaseState={databaseState} backendValue={backendValue} databaseValue={databaseValue} checkHealth={() => void checkHealth()} loading={loadingHealth} error={healthError} onNavigate={navigate}/>
      case 'campus-map': return <CampusMapPage onNavigate={navigate}/>
      case 'scenario-lab': return <ScenarioLabPage/>
      case 'energy': return <DomainPage domain="energy"/>
      case 'water': return <DomainPage domain="water"/>
      case 'environment': return <DomainPage domain="environment"/>
      case 'crowd-mobility': return <DomainPage domain="crowd"/>
      case 'methodology': return <MethodologyPage/>
    }
  }

  return <div className="min-h-screen bg-[#F4F7F6] text-slate-900"><Sidebar active={activePage} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/><div className="min-h-screen lg:pl-[258px]"><div className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#F4F7F6]/95 px-4 py-3 backdrop-blur sm:px-6 lg:hidden"><div className="flex items-center justify-between gap-3"><button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm"><Menu size={18}/></button><button type="button" onClick={() => navigate('overview')} className="text-left"><BrandMark compact/></button><span className="h-9 w-9"/></div></div><main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 sm:py-7 lg:px-9 lg:py-8"><header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">Campus intelligence / {pageTitle}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">{activePage === 'overview' ? 'Campus overview' : pageTitle}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A presentation-ready workspace for exploring a future campus digital twin, with demonstration inputs labelled clearly.</p></div><div className="flex flex-wrap items-center gap-2"><Badge tone="amber"><span className="h-1.5 w-1.5 rounded-full bg-amber-400"/>Development build</Badge><span className="text-[10px] text-slate-400">{lastChecked ? `Checked ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Checking API status…'}</span></div></header>{pageContent()}<footer className="mt-9 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>Campus OS · Campus digital twin prototype</p><p className="inline-flex items-center gap-1.5"><ShieldCheck size={12}/> Demo inputs only · no campus operational data connected</p></footer></main></div></div>
}
