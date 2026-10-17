
import { useEffect, useState } from 'react'

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

function StatusCard({
  title,
  value,
  detail,
  good,
}: {
  title: string
  value: string
  detail: string
  good: boolean
}) {
  return (




    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
      <span
        aria-label={good ? 'Available' : 'Unavailable'}
        className={`mt-5 inline-block h-2 w-2 rounded-full ${
          good ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />
    </article>
  )
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      try {
        const response = await fetch(
          'http://localhost:8001/api/health',
          { signal: controller.signal },
        )

        const data = (await response.json()) as HealthResponse
        setHealth(data)

        if (!response.ok) {
          setError(data.message ?? 'Backend health check failed.')
        }
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to connect to the backend.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void checkHealth()

    return () => controller.abort()
  }, [])

  const backendAvailable = health?.status === 'ok'
  const databaseConnected = health?.database.status === 'connected'

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
          Digital twin platform
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Campus OS
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Simulate the change digitally before implementing it physically.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <StatusCard
            title="FastAPI backend"
            value={
              loading
                ? 'Checking...'
                : backendAvailable
                  ? 'Connected'
                  : 'Unavailable'
            }
            detail="GET /api/health"
            good={Boolean(backendAvailable)}
          />

          <StatusCard
            title="PostgreSQL"
            value={
              loading
                ? 'Checking...'
                : databaseConnected
                  ? 'Connected'
                  : 'Not connected'
            }
            detail="Live database connectivity"
            good={Boolean(databaseConnected)}
          />
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200"
          >
            {error}
          </div>
        )}

        {health && (
          <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold">API response</h2>
            <pre className="mt-4 overflow-x-auto text-sm text-emerald-300">
              {JSON.stringify(health, null, 2)}
            </pre>
          </section>
        )}

        <p className="mt-8 text-sm text-slate-500">
          Campus OS MVP · Foundation milestone
        </p>
      </div>
    </main>
  )
}

