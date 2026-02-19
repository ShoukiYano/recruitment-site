import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { runEvaluation } from "@/lib/ai/evaluation-service"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "未認証" }, { status: 401 })
  }

  const { applicationId } = await request.json()
  if (!applicationId) {
    return NextResponse.json({ error: "applicationIdが必要です" }, { status: 400 })
  }

  try {
    // applicationが自テナントのものかチェック
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { job: { select: { tenantId: true } } },
    })
    if (!application) {
      return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 })
    }
    if (
      session.user.role !== "SYSTEM_ADMIN" &&
      application.job.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    await runEvaluation(applicationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[AI評価] エラー:", error)
    return NextResponse.json({ error: "AI評価に失敗しました" }, { status: 500 })
  }
}
