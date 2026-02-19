import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// AI設定取得
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

    // テナントデフォルト設定（jobIdがnull）を取得
    let settings = await prisma.aISetting.findFirst({
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
  try {
    const body = await request.json()
    const { tenantId, weights, thresholds, requiredSkills, autoActions } = body

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdは必須です" },
        { status: 400 }
      )
    }

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
    const settings = await prisma.aISetting.upsert({
      where: {
        id: (
          await prisma.aISetting.findFirst({
            where: { tenantId, jobId: null },
          })
        )?.id ?? "",
      },
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
