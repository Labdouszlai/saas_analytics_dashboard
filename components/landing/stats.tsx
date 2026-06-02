const STATS = [
  { value: "100%", label: "Self-hostable & open" },
  { value: "<100ms", label: "Typical query response" },
  { value: "3", label: "Date ranges, one click" },
  { value: "0", label: "Vendor lock-in" },
]

export function Stats() {
  return (
    <section id="stats" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card px-6 py-12 sm:px-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-semibold tracking-tight text-primary">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
