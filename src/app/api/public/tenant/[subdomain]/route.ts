import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/public/tenant/[subdomain]
 * テナント固有ログインページ用の公開情報（認証不要）
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: {
      name: true,
      settings: { select: { logoUrl: true } },
    },
  })

  if (!tenant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    name: tenant.name,
    logoUrl: tenant.settings?.logoUrl ?? null,
  })
}
