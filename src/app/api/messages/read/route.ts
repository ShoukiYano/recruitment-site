import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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

    await markAsRead(messageIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[メッセージAPI] 既読更新エラー:", error)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 })
  }
}
