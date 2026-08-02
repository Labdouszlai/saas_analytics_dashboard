import { Suspense } from "react"
import { getCustomers } from "@/lib/db/queries"
import { PageHeader } from "@/components/layout/page-header"
import { CustomerSearch } from "@/components/customers/customer-search"
import { CustomerTable } from "@/components/customers/customer-table"
import { CustomerPagination } from "@/components/customers/customer-pagination"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ q?: string; page?: string }>

async function CustomerList({ search, page }: { search?: string; page: number }) {
  const result = await getCustomers({ search, page, pageSize: 10 })
  return (
    <div className="flex flex-col gap-4">
      <CustomerTable rows={result.rows} />
      <CustomerPagination page={result.page} totalPages={result.totalPages} total={result.total} />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Browse, search, and inspect every customer in your account."
      />
      <CustomerSearch />
      <Suspense key={`${q ?? ""}-${currentPage}`} fallback={<TableSkeleton />}>
        <CustomerList search={q} page={currentPage} />
      </Suspense>
    </div>
  )
}
