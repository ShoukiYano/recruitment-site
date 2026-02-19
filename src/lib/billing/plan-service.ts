import { prisma } from "@/lib/prisma"
import type { BillingPlan } from "@prisma/client"

/**
 * プラン一覧取得
 */
export async function getPlans(): Promise<BillingPlan[]> {
  return prisma.billingPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: "asc" },
  })
}

/**
 * プラン取得
 */
export async function getPlan(planId: string): Promise<BillingPlan> {
  const plan = await prisma.billingPlan.findUnique({ where: { id: planId } })
  if (!plan) throw new Error("プランが見つかりません")
  return plan
}

/**
 * プラン作成
 */
export async function createPlan(data: {
  name: string
  type: "STARTER" | "BUSINESS" | "ENTERPRISE"
  monthlyPrice: number | null
  applicationLimit: number | null
  jobLimit: number | null
  userLimit: number | null
  features: Record<string, boolean>
}): Promise<BillingPlan> {
  return prisma.billingPlan.create({ data })
}

/**
 * プラン変更
 */
export async function changePlan(tenantId: string, newPlanId: string): Promise<void> {
  await prisma.tenantBilling.update({
    where: { tenantId },
    data: { planId: newPlanId },
  })
}

/**
 * 上限チェック
 */
export function isWithinLimit(
  plan: BillingPlan,
  current: number,
  type: "application" | "job" | "user"
): boolean {
  const limit =
    type === "application"
      ? plan.applicationLimit
      : type === "job"
        ? plan.jobLimit
        : plan.userLimit

  if (limit === null) return true // 無制限
  return current < limit
}
