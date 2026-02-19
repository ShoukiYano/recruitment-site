import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { Tenant } from "@prisma/client"

// サーバーコンポーネント用: リクエストヘッダーからtenant_idを取得
export async function getTenantId(): Promise<string | null> {
  const headersList = await headers()
  return headersList.get("x-tenant-id")
}

// テナント情報取得（サーバーコンポーネント用）
export async function getCurrentTenant(): Promise<Tenant | null> {
  const tenantId = await getTenantId()
  if (!tenantId) return null

  return prisma.tenant.findUnique({
    where: { id: tenantId, isActive: true },
    include: { settings: true },
  })
}

// API Route用: リクエストからtenant_idを取得
export function getTenantIdFromRequest(request: Request): string | null {
  return request.headers.get("x-tenant-id")
}

// テナントIDを強制取得（null の場合は例外）
export async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error("テナントIDが見つかりません")
  return tenantId
}
