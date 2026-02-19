import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { markAsRead } from "@/lib/services/message-service"
import { z } from "zod"

const readSchema = z.object({
  messageIds: z.array(z.string()).min(1),
})

/**
 * POST /api/messages/read
 * メッセージを既読にする
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { messageIds } = readSchema.parse(body)

    // 対象メッセージが自分のテナント or 自分の求職者IDに属するか確認
    const messages = await prisma.message.findMany({
      where: { id: { in: messageIds } },
      select: { id: true, tenantId: true, applicationId: true },
    })

    if (messages.length !== messageIds.length) {
      return NextResponse.json({ error: "無効なメッセージIDが含まれています" }, { status: 400 })
    }

    const isJobSeeker = session.user.role === "JOB_SEEKER"
    for (const msg of messages) {
      if (isJobSeeker) {
        // 求職者は自分が関連する応募のメッセージのみ既読可
        const application = await prisma.application.findFirst({
          where: { id: msg.applicationId, jobSeekerId: session.user.id },
        })
        if (!application) {
          return NextResponse.json({ error: "権限がありません" }, { status: 403 })
        }
      } else {
        // テナントユーザーは自テナントのメッセージのみ既読可
        if (
          session.user.role !== "SYSTEM_ADMIN" &&
          msg.tenantId !== session.user.tenantId
        ) {
          return NextResponse.json({ error: "権限がありません" }, { status: 403 })
        }
      }
    }

    await markAsRead(messageIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("[メッセージAPI] 既読更新エラー:", error)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 })
  }
}
