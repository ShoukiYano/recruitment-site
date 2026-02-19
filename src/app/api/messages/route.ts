import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMessagesByTenant, getMessagesByJobSeeker, sendMessage } from "@/lib/services/message-service"
import { z } from "zod"

const sendMessageSchema = z.object({
  applicationId: z.string().min(1),
  content: z.string().min(1, "メッセージを入力してください"),
})

/**
 * GET /api/messages
 * メッセージスレッド一覧取得（企業側 or 求職者側）
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword") ?? undefined

  try {
    if (session.user.role === "JOB_SEEKER") {
      const threads = await getMessagesByJobSeeker(session.user.id)
      return NextResponse.json(threads)
    }

    if (!session.user.tenantId) {
      return NextResponse.json({ error: "テナント情報が見つかりません" }, { status: 400 })
    }

    const threads = await getMessagesByTenant(session.user.tenantId, { keyword })
    return NextResponse.json(threads)
  } catch (error) {
    console.error("[メッセージAPI] 一覧取得エラー:", error)
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 })
  }
}

/**
 * POST /api/messages
 * メッセージ送信
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { applicationId, content } = sendMessageSchema.parse(body)

    // 送信者タイプを決定
    const senderType = session.user.role === "JOB_SEEKER" ? "JOB_SEEKER" : "COMPANY"

    // テナントIDの取得
    let tenantId: string
    if (senderType === "JOB_SEEKER") {
      // 求職者の場合は応募からテナントIDを取得
      const { prisma } = await import("@/lib/prisma")
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { tenantId: true, jobSeekerId: true },
      })
      if (!application) {
        return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 })
      }
      if (application.jobSeekerId !== session.user.id) {
        return NextResponse.json({ error: "権限がありません" }, { status: 403 })
      }
      tenantId = application.tenantId
    } else {
      if (!session.user.tenantId) {
        return NextResponse.json({ error: "テナント情報が見つかりません" }, { status: 400 })
      }
      tenantId = session.user.tenantId
    }

    const message = await sendMessage({
      tenantId,
      applicationId,
      senderId: session.user.id,
      senderType,
      content,
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("[メッセージAPI] 送信エラー:", error)
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 })
  }
}
