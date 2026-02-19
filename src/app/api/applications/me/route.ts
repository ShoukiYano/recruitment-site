import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

// 自分の応募一覧API
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

    const applications = await prisma.application.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: {
        job: {
          include: {
            tenant: { include: { settings: true } },
          },
        },
        evaluation: {
          select: { rank: true, score: true },
        },
      },
      orderBy: { appliedAt: "desc" },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("応募一覧取得エラー:", error)
    return NextResponse.json(
      { error: "応募一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}
