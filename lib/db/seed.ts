import "dotenv/config"
import { db, pool } from "./index"
import { customers, transactions, user, type NewCustomer, type NewTransaction } from "./schema"
import { eq } from "drizzle-orm"

const FIRST_NAMES = [
  "Alice", "Liam", "Noah", "Emma", "Olivia", "Ava", "Sophia", "Mason", "Lucas", "Mia",
  "Ethan", "Isabella", "James", "Charlotte", "Benjamin", "Amelia", "Elijah", "Harper",
  "Oliver", "Evelyn", "Jacob", "Abigail", "William", "Emily", "Michael", "Ella",
]

const LAST_NAMES = [
  "Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
]

const SOURCES = ["Organic", "Direct", "Referral", "Social", "Paid"] as const
const TXN_STATUSES = ["completed", "completed", "completed", "pending", "refunded"] as const

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** A date `daysAgo` days before now, with a random time of day. */
function dateDaysAgo(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0)
  return d
}

/**
 * Seeds a realistic demo dataset for a single user.
 * Reused by the sign-up flow (Phase 2) and the standalone CLI runner below.
 *
 * Idempotent per user: if the user already has customers, it skips seeding.
 */
export async function seedUserData(
  userId: string,
  opts: { customerCount?: number; daysOfHistory?: number } = {},
): Promise<{ customers: number; transactions: number; skipped: boolean }> {
  const customerCount = opts.customerCount ?? randomInt(40, 60)
  const daysOfHistory = opts.daysOfHistory ?? 120

  const existing = await db.select({ id: customers.id }).from(customers).where(eq(customers.userId, userId)).limit(1)
  if (existing.length > 0) {
    return { customers: 0, transactions: 0, skipped: true }
  }

  // --- Customers -----------------------------------------------------------
  const customerRows: NewCustomer[] = Array.from({ length: customerCount }, () => {
    const first = randomItem(FIRST_NAMES)
    const last = randomItem(LAST_NAMES)
    const joinedDaysAgo = randomInt(0, daysOfHistory)
    return {
      userId,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${randomInt(1, 999)}@example.com`,
      status: Math.random() < 0.85 ? "active" : "churned",
      joinDate: dateDaysAgo(joinedDaysAgo),
    }
  })

  const insertedCustomers = await db.insert(customers).values(customerRows).returning({
    id: customers.id,
    joinDate: customers.joinDate,
  })

  // --- Transactions --------------------------------------------------------
  const transactionRows: NewTransaction[] = []
  for (const c of insertedCustomers) {
    const joinedDaysAgo = Math.max(0, Math.floor((Date.now() - new Date(c.joinDate).getTime()) / 86_400_000))
    const txnCount = randomInt(0, 8)
    for (let i = 0; i < txnCount; i++) {
      transactionRows.push({
        userId,
        customerId: c.id,
        amount: (randomInt(900, 49900) / 100).toFixed(2),
        status: randomItem(TXN_STATUSES),
        source: randomItem(SOURCES),
        createdAt: dateDaysAgo(randomInt(0, joinedDaysAgo)),
      })
    }
  }

  if (transactionRows.length > 0) {
    await db.insert(transactions).values(transactionRows)
  }

  return { customers: insertedCustomers.length, transactions: transactionRows.length, skipped: false }
}

/**
 * Standalone CLI runner for local development: `pnpm db:seed`.
 * Seeds demo data for every existing user that has none yet. Useful right after
 * creating an account locally. In production, seeding happens on sign-up.
 */
async function main() {
  const users = await db.select({ id: user.id, email: user.email }).from(user)

  if (users.length === 0) {
    console.log("No users found. Sign up first, then run `pnpm db:seed` to populate demo data.")
    return
  }

  for (const u of users) {
    const result = await seedUserData(u.id)
    if (result.skipped) {
      console.log(`Skipped ${u.email} (already has data).`)
    } else {
      console.log(`Seeded ${u.email}: ${result.customers} customers, ${result.transactions} transactions.`)
    }
  }
}

// Only run main() when executed directly (e.g. via tsx), not when imported.
const isDirectRun = process.argv[1]?.includes("seed")
if (isDirectRun) {
  main()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err)
      pool.end().finally(() => process.exit(1))
    })
}
