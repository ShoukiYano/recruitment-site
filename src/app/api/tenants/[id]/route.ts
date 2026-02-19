import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assertSystemAdmin } from "@/lib/security/tenant-guard"
import { z } from "zod"

// テナント詳細（SYSTEM_ADMINのみ）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 })
    assertSystemAdmin(session.user.role)

    const { id } = await params
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        billing: { include: { plan: true } },
        _count: { select: { users: true, jobs: true, applications: true } },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: "テナントが見つかりません" }, { status: 404 })
    }

    return NextResponse.json({ tenant })
  } catch (error) {
    if (error instanceof Error && error.message === "システム管理者権限が必要です") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 })
  }
}

// テナント更新スキーマ
const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  subdomain: z.string().regex(/^[a-z0-9-]+$/).optional(),
  customDomain: z.string().nullable().optional(),
  plan: z.enum(["STARTER", "BUSINESS", "ENTERPRISE"]).optional(),
  isActive: z.boolean().optional(),
})

// テナント更新（SYSTEM_ADMINのみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 })
    assertSystemAdmin(session.user.role)

    const { id } = await params
    const body = await request.json()
    const parsed = updateTenantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "テナントが見つかりません" }, { status: 404 })
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: parsed.data,
      include: { settings: true },
    })

    return NextResponse.json({ tenant })
  } catch (error) {
    if (error instanceof Error && error.message === "システム管理者権限が必要です") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 })
  }
}

// テナント論理削除（SYSTEM_ADMINのみ）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 })
    assertSystemAdmin(session.user.role)

    const { id } = await params
    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "テナントが見つかりません" }, { status: 404 })
    }

    // 論理削除（isActive=false）
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ tenant, message: "テナントを無効化しました" })
  } catch (error) {
    if (error instanceof Error && error.message === "システム管理者権限が必要です") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 })
  }
}
