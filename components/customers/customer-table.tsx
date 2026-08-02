import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { CustomerRow } from "@/lib/db/queries"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CustomerTable({ rows }: { rows: CustomerRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="font-medium">No customers found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Purchases</TableHead>
            <TableHead className="text-right">Lifetime value</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id} className="group">
              <TableCell>
                <Link href={`/customers/${c.id}`} className="flex flex-col">
                  <span className="font-medium leading-tight">{c.name}</span>
                  <span className="text-sm text-muted-foreground">{c.email}</span>
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatDate(c.joinDate)}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right tabular-nums">
                {formatNumber(c.totalPurchases)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(c.lifetimeValue)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex justify-end text-muted-foreground transition-colors group-hover:text-foreground"
                  aria-label={`View ${c.name}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
