import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import { generateInvoice } from "./invoice-service"

/**
 * 月次請求書生成バッチ（月初に実行）
 * 前月分の請求書をアクティブなテナントに対して一括生成する
 */
export async function generateMonthlyInvoices(): Promise<void> {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const activeBillings = await prisma.tenantBilling.findMany({
    where: { tenant: { isActive: true } },
    include: { plan: true },
  })

  for (const billing of activeBillings) {
    if (!billing.plan.monthlyPrice) continue
    await generateInvoice(billing.tenantId, { start: lastMonth, end: lastMonthEnd })
  }

  console.log(`月次請求書生成完了: ${activeBillings.length}件`)
}

/**
 * 支払期限超過チェック
 * 送付済みで支払期限を過ぎた請求書を延滞ステータスに更新する
 */
export async function checkOverdueInvoices(): Promise<void> {
  const now = new Date()

  await prisma.invoice.updateMany({
    where: {
      status: InvoiceStatus.SENT,
      dueAt: { lt: now },
    },
    data: { status: InvoiceStatus.OVERDUE },
  })

  console.log("延滞請求書チェック完了")
}
