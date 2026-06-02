import { type NextRequest, NextResponse } from "next/server"
import { getExportRows, parseRange } from "@/lib/db/queries"

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  try {
    const range = parseRange(request.nextUrl.searchParams.get("range") ?? undefined)
    const rows = await getExportRows(range)

    const header = ["Transaction ID", "Date", "Customer", "Email", "Amount", "Status", "Source"]
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [r.transactionId, r.date, r.customer, r.email, r.amount.toFixed(2), r.status, r.source]
          .map(escapeCsv)
          .join(","),
      ),
    ]
    const csv = lines.join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${range}d-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error("[v0] CSV export failed:", err)
    return NextResponse.json({ error: "Unauthorized or export failed" }, { status: 401 })
  }
}
