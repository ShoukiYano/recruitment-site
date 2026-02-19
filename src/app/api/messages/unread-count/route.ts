import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUnreadCount } from "@/lib/services/message-service"

/**
 * GET /api/messages/unread-count
 * 未読メッセージ数を取得
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const userType = session.user.role === "JOB_SEEKER" ? "JOB_SEEKER" : "COMPANY"
    const count = await getUnreadCount(session.user.id, userType)
    return NextResponse.json({ count })
  } catch (error) {
    console.error("[メッセージAPI] 未読数取得エラー:", error)
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 })
  }
}
