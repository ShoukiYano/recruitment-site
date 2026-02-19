import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// テナント設定取得
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  // SYSTEM_ADMIN はクエリパラメータのtenantIdを使用、それ以外はセッションのtenantIdのみ
  const { searchParams } = new URL(request.url)
  const tenantId =
    session.user.role === "SYSTEM_ADMIN"
      ? (searchParams.get("tenantId") ?? session.user.tenantId)
      : session.user.tenantId

  if (!tenantId) {
    return NextResponse.json({ error: "tenantIdは必須です" }, { status: 400 })
  }

  try {
    const settings = await prisma.tenantSetting.findUnique({
      where: { tenantId },
    })

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, subdomain: true, customDomain: true },
    })

    return NextResponse.json({
      data: {
        ...settings,
        tenantName: tenant?.name,
        subdomain: tenant?.subdomain,
        customDomain: tenant?.customDomain,
      },
    })
  } catch (error) {
    console.error("テナント設定取得エラー:", error)
    return NextResponse.json(
      { error: "テナント設定の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// テナント設定更新
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { logoUrl, primaryColor, secondaryColor, branding } = body

    // テナントIDはセッションから取得（リクエストボディの値は使わない）
    const tenantId = session.user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: "tenantIdは必須です" }, { status: 400 })
    }

    const settings = await prisma.tenantSetting.upsert({
      where: { tenantId },
      create: { tenantId, logoUrl, primaryColor, secondaryColor, branding },
      update: { logoUrl, primaryColor, secondaryColor, branding },
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error("テナント設定更新エラー:", error)
    return NextResponse.json(
      { error: "テナント設定の更新に失敗しました" },
      { status: 500 }
    )
  }
}
