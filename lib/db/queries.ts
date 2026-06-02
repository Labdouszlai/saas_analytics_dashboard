import "server-only"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { customers, transactions } from "@/lib/db/schema"
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"
import { headers } from "next/headers"

/** Resolve the current user id or throw. There is no RLS — every query below
 *  scopes by this id so users only ever see their own data. */
export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type RangeDays = 7 | 30 | 90

export function parseRange(value: string | undefined): RangeDays {
  const n = Number(value)
  return n === 7 || n === 90 ? n : 30
}

const num = (v: unknown): number => (v == null ? 0 : Number(v))

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

export type Kpi = {
  totalRevenue: number
  revenueChange: number
  activeCustomers: number
  customersChange: number
  totalTransactions: number
  transactionsChange: number
  conversionRate: number
  conversionChange: number
}

/** KPI cards: current period vs the immediately preceding period of equal length. */
export async function getDashboardKpis(range: RangeDays): Promise<Kpi> {
  const userId = await getUserId()

  const { rows } = await db.execute(sql`
    WITH windows AS (
      SELECT
        ${userId}::text AS uid,
        (now() - (${range} || ' days')::interval) AS cur_start,
        (now() - (${range * 2} || ' days')::interval) AS prev_start,
        (now() - (${range} || ' days')::interval) AS prev_end
    )
    SELECT
      COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'completed' AND t."createdAt" >= w.cur_start), 0) AS cur_revenue,
      COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'completed' AND t."createdAt" >= w.prev_start AND t."createdAt" < w.prev_end), 0) AS prev_revenue,
      COUNT(t.id) FILTER (WHERE t."createdAt" >= w.cur_start) AS cur_txns,
      COUNT(t.id) FILTER (WHERE t."createdAt" >= w.prev_start AND t."createdAt" < w.prev_end) AS prev_txns,
      COUNT(t.id) FILTER (WHERE t.status = 'completed' AND t."createdAt" >= w.cur_start) AS cur_completed,
      COUNT(t.id) FILTER (WHERE t.status = 'completed' AND t."createdAt" >= w.prev_start AND t."createdAt" < w.prev_end) AS prev_completed
    FROM windows w
    LEFT JOIN transactions t ON t."userId" = w.uid
  `)

  const r = rows[0] ?? {}
  const curRevenue = num(r.cur_revenue)
  const prevRevenue = num(r.prev_revenue)
  const curTxns = num(r.cur_txns)
  const prevTxns = num(r.prev_txns)
  const curCompleted = num(r.cur_completed)
  const prevCompleted = num(r.prev_completed)

  const { rows: custRows } = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') AS active_now,
      COUNT(*) FILTER (WHERE "joinDate" >= (now() - (${range} || ' days')::interval)) AS new_cur,
      COUNT(*) FILTER (WHERE "joinDate" >= (now() - (${range * 2} || ' days')::interval) AND "joinDate" < (now() - (${range} || ' days')::interval)) AS new_prev
    FROM customers WHERE "userId" = ${userId}
  `)
  const c = custRows[0] ?? {}
  const activeCustomers = num(c.active_now)
  const newCur = num(c.new_cur)
  const newPrev = num(c.new_prev)

  const curConversion = curTxns === 0 ? 0 : (curCompleted / curTxns) * 100
  const prevConversion = prevTxns === 0 ? 0 : (prevCompleted / prevTxns) * 100

  return {
    totalRevenue: curRevenue,
    revenueChange: pctChange(curRevenue, prevRevenue),
    activeCustomers,
    customersChange: pctChange(newCur, newPrev),
    totalTransactions: curTxns,
    transactionsChange: pctChange(curTxns, prevTxns),
    conversionRate: curConversion,
    conversionChange: pctChange(curConversion, prevConversion),
  }
}

export type DailyPoint = { date: string; revenue: number; transactions: number }

/** Daily revenue + transaction counts with gaps filled, for the range. */
export async function getRevenueOverTime(range: RangeDays): Promise<DailyPoint[]> {
  const userId = await getUserId()
  const { rows } = await db.execute(sql`
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS date,
      COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'completed'), 0) AS revenue,
      COUNT(t.id) AS transactions
    FROM generate_series(
      date_trunc('day', now()) - ((${range} - 1) || ' days')::interval,
      date_trunc('day', now()),
      interval '1 day'
    ) AS d(day)
    LEFT JOIN transactions t
      ON date_trunc('day', t."createdAt") = d.day AND t."userId" = ${userId}
    GROUP BY d.day
    ORDER BY d.day
  `)
  return rows.map((r) => ({
    date: String(r.date),
    revenue: num(r.revenue),
    transactions: num(r.transactions),
  }))
}

export type GrowthPoint = { date: string; total: number }

/** Cumulative customer count per day across the range. */
export async function getCustomerGrowth(range: RangeDays): Promise<GrowthPoint[]> {
  const userId = await getUserId()
  const { rows } = await db.execute(sql`
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS date,
      (SELECT COUNT(*) FROM customers c
        WHERE c."userId" = ${userId} AND c."joinDate" < d.day + interval '1 day') AS total
    FROM generate_series(
      date_trunc('day', now()) - ((${range} - 1) || ' days')::interval,
      date_trunc('day', now()),
      interval '1 day'
    ) AS d(day)
    ORDER BY d.day
  `)
  return rows.map((r) => ({ date: String(r.date), total: num(r.total) }))
}

export type TrafficSource = { source: string; transactions: number; revenue: number }

export async function getTrafficSources(range: RangeDays): Promise<TrafficSource[]> {
  const userId = await getUserId()
  const { rows } = await db.execute(sql`
    SELECT
      source,
      COUNT(*) AS transactions,
      COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS revenue
    FROM transactions
    WHERE "userId" = ${userId} AND "createdAt" >= (now() - (${range} || ' days')::interval)
    GROUP BY source
    ORDER BY revenue DESC
  `)
  return rows.map((r) => ({
    source: String(r.source),
    transactions: num(r.transactions),
    revenue: num(r.revenue),
  }))
}

export type RecentTransaction = {
  id: string
  amount: number
  status: string
  source: string
  createdAt: Date
  customerName: string
  customerEmail: string
}

export async function getRecentTransactions(limit = 8): Promise<RecentTransaction[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      status: transactions.status,
      source: transactions.source,
      createdAt: transactions.createdAt,
      customerName: customers.name,
      customerEmail: customers.email,
    })
    .from(transactions)
    .leftJoin(customers, eq(transactions.customerId, customers.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    amount: num(r.amount),
    status: r.status,
    source: r.source,
    createdAt: r.createdAt,
    customerName: r.customerName ?? "Unknown",
    customerEmail: r.customerEmail ?? "",
  }))
}

export type CustomerRow = {
  id: string
  name: string
  email: string
  status: string
  joinDate: Date
  lifetimeValue: number
  totalPurchases: number
}

export async function getCustomers(opts: { search?: string; page?: number; pageSize?: number }): Promise<{
  rows: CustomerRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const userId = await getUserId()
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = opts.pageSize ?? 10
  const offset = (page - 1) * pageSize
  const search = opts.search?.trim()

  const searchFilter = search
    ? or(ilike(customers.name, `%${search}%`), ilike(customers.email, `%${search}%`))
    : undefined
  const whereClause = searchFilter ? and(eq(customers.userId, userId), searchFilter) : eq(customers.userId, userId)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers)
    .where(whereClause)

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      status: customers.status,
      joinDate: customers.joinDate,
      lifetimeValue: sql<string>`COALESCE((SELECT SUM(amount) FROM transactions t WHERE t."customerId" = ${customers.id} AND t.status = 'completed'), 0)`,
      totalPurchases: sql<number>`(SELECT COUNT(*)::int FROM transactions t WHERE t."customerId" = ${customers.id})`,
    })
    .from(customers)
    .where(whereClause)
    .orderBy(desc(customers.joinDate))
    .limit(pageSize)
    .offset(offset)

  return {
    rows: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      status: r.status,
      joinDate: r.joinDate,
      lifetimeValue: num(r.lifetimeValue),
      totalPurchases: num(r.totalPurchases),
    })),
    total: count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  }
}

export type CustomerDetail = {
  id: string
  name: string
  email: string
  status: string
  joinDate: Date
  lifetimeValue: number
  totalPurchases: number
  transactions: { id: string; amount: number; status: string; source: string; createdAt: Date }[]
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const userId = await getUserId()
  const [c] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .limit(1)
  if (!c) return null

  const txns = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      status: transactions.status,
      source: transactions.source,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .where(and(eq(transactions.customerId, id), eq(transactions.userId, userId)))
    .orderBy(desc(transactions.createdAt))

  const mapped = txns.map((t) => ({ ...t, amount: num(t.amount) }))
  const lifetimeValue = mapped
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.status,
    joinDate: c.joinDate,
    lifetimeValue,
    totalPurchases: mapped.length,
    transactions: mapped,
  }
}

export type ExportRow = {
  transactionId: string
  date: string
  customer: string
  email: string
  amount: number
  status: string
  source: string
}

/** Flat rows for CSV export, scoped to the user and date range. */
export async function getExportRows(range: RangeDays): Promise<ExportRow[]> {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      status: transactions.status,
      source: transactions.source,
      createdAt: transactions.createdAt,
      customerName: customers.name,
      customerEmail: customers.email,
    })
    .from(transactions)
    .leftJoin(customers, eq(transactions.customerId, customers.id))
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.createdAt} >= (now() - (${range} || ' days')::interval)`,
      ),
    )
    .orderBy(asc(transactions.createdAt))

  return rows.map((r) => ({
    transactionId: r.id,
    date: r.createdAt.toISOString(),
    customer: r.customerName ?? "Unknown",
    email: r.customerEmail ?? "",
    amount: num(r.amount),
    status: r.status,
    source: r.source,
  }))
}
