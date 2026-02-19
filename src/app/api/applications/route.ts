import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { runEvaluation } from "@/lib/ai/evaluation-service"

// 応募API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    // 求職者を取得
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { email: session.user.email },
    })

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "求職者アカウントが見つかりません" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { jobId, formData } = body

    if (!jobId || !formData) {
      return NextResponse.json(
        { error: "求人IDとフォームデータは必須です" },
        { status: 400 }
      )
    }

    // 求人の存在確認
    const job = await prisma.job.findFirst({
      where: { id: jobId, status: "PUBLISHED" },
    })

    if (!job) {
      return NextResponse.json(
        { error: "求人が見つかりません" },
        { status: 404 }
      )
    }

    // 重複応募チェック
    const existing = await prisma.application.findFirst({
      where: {
        jobId,
        jobSeekerId: jobSeeker.id,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "この求人には既に応募済みです" },
        { status: 409 }
      )
    }

    // 応募作成
    const application = await prisma.application.create({
      data: {
        tenantId: job.tenantId,
        jobId,
        jobSeekerId: jobSeeker.id,
        formData,
      },
      include: {
        job: true,
      },
    })

    // バックグラウンドでAI評価を非同期実行（レスポンスはブロックしない）
    runEvaluation(application.id).catch((err) =>
      console.error("[AI評価] バックグラウンド実行エラー:", err)
    )

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("応募エラー:", error)
    return NextResponse.json(
      { error: "応募の送信に失敗しました" },
      { status: 500 }
    )
  }
}
