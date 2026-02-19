import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMessageThread } from "@/lib/services/message-service"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/messages/[applicationId]
 * 応募IDに紐づくメッセージスレッドを取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const { applicationId } = await params

  try {
    // 応募の存在確認とアクセス権チェック
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { tenantId: true, jobSeekerId: true },
    })

    if (!application) {
      return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 })
    }

    // 求職者は自分の応募のみ閲覧可能
    if (session.user.role === "JOB_SEEKER" && application.jobSeekerId !== session.user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    // 企業側は自テナントの応募のみ閲覧可能
    if (
      session.user.role !== "JOB_SEEKER" &&
      session.user.role !== "SYSTEM_ADMIN" &&
      application.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const messages = await getMessageThread(applicationId)
    return NextResponse.json(messages)
  } catch (error) {
    console.error("[メッセージAPI] スレッド取得エラー:", error)
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 })
  }
}
