import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

// 求職者のメッセージ一覧API
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { email: session.user.email },
    })

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "求職者アカウントが見つかりません" },
        { status: 404 }
      )
    }

    // 求職者に関連する応募のメッセージを取得
    const messages = await prisma.message.findMany({
      where: {
        application: {
          jobSeekerId: jobSeeker.id,
        },
      },
      include: {
        application: {
          include: {
            job: true,
            tenant: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("メッセージ取得エラー:", error)
    return NextResponse.json(
      { error: "メッセージの取得に失敗しました" },
      { status: 500 }
    )
  }
}
