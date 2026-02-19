import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assertSystemAdmin } from "@/lib/security/tenant-guard"
import bcrypt from "bcryptjs"
import { z } from "zod"

// テナント一覧（SYSTEM_ADMINのみ）
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 })
    assertSystemAdmin(session.user.role)

    const tenants = await prisma.tenant.findMany({
      include: { settings: true, billing: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ tenants })
  } catch (error) {
    if (error instanceof Error && error.message === "システム管理者権限が必要です") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 })
  }
}

// テナント作成スキーマ
const createTenantSchema = z.object({
  name: z.string().min(1, "企業名を入力してください"),
  subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/, "半角英数字とハイフンのみ使用可能です"),
  adminEmail: z.string().email("有効なメールアドレスを入力してください"),
  adminName: z.string().min(1, "担当者名を入力してください"),
  adminPassword: z.string().min(8, "パスワードは8文字以上です"),
})

// テナント作成（SYSTEM_ADMINのみ）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 })
    assertSystemAdmin(session.user.role)

    const body = await request.json()
    const parsed = createTenantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, subdomain, adminEmail, adminName, adminPassword } = parsed.data
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain,
        settings: { create: {} },
        users: {
          create: {
            email: adminEmail,
            name: adminName,
            passwordHash,
            role: "TENANT_ADMIN",
          },
        },
      },
      include: { settings: true },
    })

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "システム管理者権限が必要です") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 })
  }
}
