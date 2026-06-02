import { LineChart, Users, Download, Server, Filter, Gauge } from "lucide-react"

const FEATURES = [
  {
    icon: LineChart,
    title: "Real-time revenue insights",
    description: "Track revenue, transactions, and conversion rate with period-over-period comparisons at a glance.",
  },
  {
    icon: Users,
    title: "Customer intelligence",
    description: "See lifetime value, purchase history, and active vs. churned customers in a searchable directory.",
  },
  {
    icon: Filter,
    title: "Flexible date ranges",
    description: "Slice every metric by the last 7, 30, or 90 days and watch the whole dashboard update instantly.",
  },
  {
    icon: Download,
    title: "One-click CSV export",
    description: "Export your transaction data for the selected range and take it into any spreadsheet or BI tool.",
  },
  {
    icon: Server,
    title: "Fully self-hostable",
    description: "Runs on any VPS, Docker container, or Node host. Point it at your own Postgres and you own it all.",
  },
  {
    icon: Gauge,
    title: "Fast by default",
    description: "Server-rendered pages and aggregated SQL queries keep the dashboard snappy even with lots of data.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand your business
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A focused toolkit for monitoring the metrics that drive growth, without the bloat.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-card-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
