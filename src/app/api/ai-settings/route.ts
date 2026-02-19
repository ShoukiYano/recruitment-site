import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// AI設定取得
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  // テナントIDはセッションから取得（SYSTEM_ADMINのみクエリパラメータを許可）
  const { searchParams } = new URL(request.url)
  const tenantId =
    session.user.role === "SYSTEM_ADMIN"
      ? (searchParams.get("tenantId") ?? session.user.tenantId)
      : session.user.tenantId

  if (!tenantId) {
    return NextResponse.json({ error: "tenantIdは必須です" }, { status: 400 })
  }

  try {
    // テナントデフォルト設定（jobIdがnull）を取得
    const settings = await prisma.aISetting.findFirst({
      where: { tenantId, jobId: null },
    })

    // 設定がない場合はデフォルト値を返す
    if (!settings) {
      return NextResponse.json({
        data: {
          tenantId,
          weights: {
            skillMatch: 40,
            experience: 25,
            education: 15,
            motivation: 10,
            responseQuality: 10,
          },
          thresholds: { s: 85, a: 70, b: 50 },
          requiredSkills: [],
          autoActions: {},
        },
      })
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error("AI設定取得エラー:", error)
    return NextResponse.json(
      { error: "AI設定の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// AI設定更新
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  // テナントIDはセッションから取得
  const tenantId = session.user.tenantId
  if (!tenantId) {
    return NextResponse.json({ error: "tenantIdは必須です" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { weights, thresholds, requiredSkills, autoActions } = body

    // 重みの合計が100かチェック
    const totalWeight = Object.values(weights as Record<string, number>).reduce(
      (sum, v) => sum + v,
      0
    )
    if (totalWeight !== 100) {
      return NextResponse.json(
        { error: "評価重みの合計は100%にしてください" },
        { status: 400 }
      )
    }

    // upsert: 既存なら更新、なければ作成
    const existing = await prisma.aISetting.findFirst({
      where: { tenantId, jobId: null },
    })

    const settings = await prisma.aISetting.upsert({
      where: { id: existing?.id ?? "" },
      create: {
        tenantId,
        weights,
        thresholds,
        requiredSkills: requiredSkills ?? [],
        autoActions: autoActions ?? {},
      },
      update: {
        weights,
        thresholds,
        requiredSkills: requiredSkills ?? [],
        autoActions: autoActions ?? {},
      },
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error("AI設定更新エラー:", error)
    return NextResponse.json(
      { error: "AI設定の更新に失敗しました" },
      { status: 500 }
    )
  }
}
