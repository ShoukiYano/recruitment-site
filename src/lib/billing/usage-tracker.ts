import { prisma } from "@/lib/prisma"

/**
 * 期間内の応募数を取得
 */
export async function getApplicationCount(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  return prisma.application.count({
    where: {
      tenantId,
      appliedAt: { gte: periodStart, lte: periodEnd },
    },
  })
}

/**
 * 利用量チェック（上限超過かどうか）
 */
export async function checkUsageLimit(
  tenantId: string,
  type: "application" | "job" | "user"
): Promise<{ isOverLimit: boolean; current: number; limit: number | null }> {
  const billing = await prisma.tenantBilling.findUnique({
    where: { tenantId },
    include: { plan: true },
  })
  if (!billing) return { isOverLimit: false, current: 0, limit: null }

  let current = 0
  let limit: number | null = null

  switch (type) {
    case "application":
      current = billing.currentApplicationCount
      limit = billing.plan.applicationLimit
      break
    case "job":
      current = billing.currentJobCount
      limit = billing.plan.jobLimit
      break
    case "user":
      current = billing.currentUserCount
      limit = billing.plan.userLimit
      break
  }

  return {
    isOverLimit: limit !== null && current >= limit,
    current,
    limit,
  }
}

/**
 * 利用量を更新（現在の月の利用量を集計してTenantBillingに反映）
 */
export async function updateUsage(tenantId: string): Promise<void> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [applicationCount, jobCount, userCount] = await Promise.all([
    getApplicationCount(tenantId, startOfMonth, endOfMonth),
    prisma.job.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, isActive: true } }),
  ])

  await prisma.tenantBilling.updateMany({
    where: { tenantId },
    data: {
      currentApplicationCount: applicationCount,
      currentJobCount: jobCount,
      currentUserCount: userCount,
    },
  })
}
