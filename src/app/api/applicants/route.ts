import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 応募者一覧API
// GET: テナントIDでフィルタ、ステータス/ランクでフィルタ可能
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const rank = searchParams.get("rank")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "20")

    // テナントIDはセッションから取得（SYSTEM_ADMINはクエリパラメータ指定も可）
    const tenantId =
      session.user.role === "SYSTEM_ADMIN"
        ? (searchParams.get("tenantId") ?? session.user.tenantId)
        : session.user.tenantId

    if (!tenantId) {
      return NextResponse.json({ error: "テナント情報がありません" }, { status: 403 })
    }

    // フィルタ条件を構築
    const where: Record<string, unknown> = { tenantId }

    if (status) {
      where.status = status
    }

    if (rank) {
      where.evaluation = { rank }
    }

    if (search) {
      where.jobSeeker = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    // 応募データ取得（リレーション含む）
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true } },
          jobSeeker: { select: { id: true, name: true, email: true } },
          evaluation: { select: { rank: true, score: true, breakdown: true, aiComment: true } },
        },
        orderBy: { appliedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("応募者一覧取得エラー:", error)
    return NextResponse.json(
      { error: "応募者一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}
