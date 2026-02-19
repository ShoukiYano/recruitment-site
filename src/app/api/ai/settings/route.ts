import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_SETTINGS = {
  weights: { skillMatch: 40, experience: 25, education: 15, motivation: 10, responseQuality: 10 },
  thresholds: { s: 85, a: 70, b: 50 },
  requiredSkills: [] as string[],
  autoActions: {} as Record<string, string>,
}

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "未認証" }, { status: 401 })
  }
  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: "テナント情報がありません" }, { status: 403 })

  const settings = await prisma.aISetting.findFirst({
    where: { tenantId, jobId: null },
  })
  return NextResponse.json({ settings: settings ?? { ...DEFAULT_SETTINGS, tenantId } })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "未認証" }, { status: 401 })
  }
  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: "テナント情報がありません" }, { status: 403 })

  const { weights, thresholds, requiredSkills, autoActions } = await request.json()

  // 重みの合計チェック
  const totalWeight = Object.values(weights as Record<string, number>).reduce((sum, v) => sum + v, 0)
  if (totalWeight !== 100) {
    return NextResponse.json({ error: "評価重みの合計は100%にしてください" }, { status: 400 })
  }

  // 閾値の順序チェック
  if (thresholds.s <= thresholds.a) {
    return NextResponse.json({ error: "Sランク閾値はAランクより大きい値にしてください" }, { status: 400 })
  }
  if (thresholds.a <= thresholds.b) {
    return NextResponse.json({ error: "Aランク閾値はBランクより大きい値にしてください" }, { status: 400 })
  }

  const existing = await prisma.aISetting.findFirst({
    where: { tenantId, jobId: null },
  })
  const settings = existing
    ? await prisma.aISetting.update({
        where: { id: existing.id },
        data: { weights, thresholds, requiredSkills, autoActions },
      })
    : await prisma.aISetting.create({
        data: { tenantId, weights, thresholds, requiredSkills, autoActions },
      })

  return NextResponse.json({ settings })
}
