import { prisma } from "@/lib/prisma"
import { InvoiceStatus } from "@prisma/client"
import type { Invoice } from "@prisma/client"

/**
 * 請求書番号生成（YYYYMM-XXXX形式）
 */
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`

  // 今月の請求書数を取得してシーケンス番号を決定
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: yearMonth } },
  })

  return `${yearMonth}-${String(count + 1).padStart(4, "0")}`
}

/**
 * 請求書生成
 */
export async function generateInvoice(
  tenantId: string,
  billingPeriod: { start: Date; end: Date }
): Promise<Invoice> {
  const billing = await prisma.tenantBilling.findUnique({
    where: { tenantId },
    include: { plan: true, tenant: true },
  })
  if (!billing || billing.plan.monthlyPrice === null) {
    throw new Error("請求プランが設定されていないか、エンタープライズプランです")
  }

  const subtotal = billing.plan.monthlyPrice
  const tax = Math.floor(subtotal * 0.1) // 消費税10%
  const total = subtotal + tax
  const invoiceNumber = await generateInvoiceNumber()

  const now = new Date()
  const dueAt = new Date(now.getFullYear(), now.getMonth() + 1, 0) // 翌月末

  return prisma.invoice.create({
    data: {
      tenantId,
      invoiceNumber,
      billingPeriodStart: billingPeriod.start,
      billingPeriodEnd: billingPeriod.end,
      subtotal,
      tax,
      total,
      status: InvoiceStatus.DRAFT,
      issuedAt: now,
      dueAt,
    },
  })
}

/**
 * 請求書一覧取得
 */
export async function getInvoices(filters?: {
  tenantId?: string
  status?: InvoiceStatus
}): Promise<Invoice[]> {
  return prisma.invoice.findMany({
    where: {
      ...(filters?.tenantId && { tenantId: filters.tenantId }),
      ...(filters?.status && { status: filters.status }),
    },
    include: { tenant: true },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * 請求書詳細取得
 */
export async function getInvoiceById(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: true },
  })
  if (!invoice) throw new Error("請求書が見つかりません")
  return invoice
}

/**
 * ステータス更新
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<Invoice> {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  })
}

/**
 * 入金確認
 */
export async function confirmPayment(invoiceId: string, paidAt: Date): Promise<Invoice> {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: InvoiceStatus.PAID, paidAt },
  })
}
