import { prisma } from "@/lib/prisma"
import type { Tenant } from "@prisma/client"

// サブドメインからテナント解決（例: company-a.example.com → Tenant）
export async function resolveTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  return prisma.tenant.findFirst({
    where: { subdomain, isActive: true },
  })
}

// カスタムドメインからテナント解決
export async function resolveTenantByCustomDomain(domain: string): Promise<Tenant | null> {
  return prisma.tenant.findFirst({
    where: { customDomain: domain, isActive: true },
  })
}

// ホスト名からテナント解決（サブドメイン & カスタムドメイン両対応）
export async function resolveTenantByHost(host: string): Promise<Tenant | null> {
  const baseDomain = process.env.BASE_DOMAIN || "example.com"

  // カスタムドメインチェック
  if (!host.endsWith(`.${baseDomain}`) && host !== baseDomain) {
    return resolveTenantByCustomDomain(host)
  }

  // サブドメイン抽出
  const subdomain = host.replace(`.${baseDomain}`, "")
  if (!subdomain || subdomain === baseDomain) return null

  return resolveTenantBySubdomain(subdomain)
}

// サブドメイン利用可能チェック
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const reserved = ["admin", "api", "www", "platform-admin", "app"]
  if (reserved.includes(subdomain)) return false

  const existing = await prisma.tenant.findUnique({ where: { subdomain } })
  return !existing
}
