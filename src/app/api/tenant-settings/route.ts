import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// テナント設定取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdは必須です" },
        { status: 400 }
      )
    }

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
  try {
    const body = await request.json()
    const { tenantId, logoUrl, primaryColor, secondaryColor, branding } = body

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdは必須です" },
        { status: 400 }
      )
    }

    const settings = await prisma.tenantSetting.upsert({
      where: { tenantId },
      create: {
        tenantId,
        logoUrl,
        primaryColor,
        secondaryColor,
        branding,
      },
      update: {
        logoUrl,
        primaryColor,
        secondaryColor,
        branding,
      },
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
