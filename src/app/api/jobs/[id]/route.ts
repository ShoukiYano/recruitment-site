import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { JobStatus } from "@prisma/client"

/**
 * PATCH /api/jobs/[id]
 * ステータス切替（DRAFT ↔ PUBLISHED / CLOSED）
 * TENANT_ADMIN / TENANT_USER のみ、自テナントの求人のみ
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !session.user.tenantId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: JobStatus }

    // 対象求人が自テナントのものか確認
    const existing = await prisma.job.findUnique({
      where: { id },
      select: { tenantId: true, status: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "求人が見つかりません" }, { status: 404 })
    }
    if (existing.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "アクセス権限がありません" }, { status: 403 })
    }

    const validStatuses: JobStatus[] = ["DRAFT", "PUBLISHED", "CLOSED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "無効なステータスです" }, { status: 400 })
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("求人ステータス更新エラー:", error)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 })
  }
}

/**
 * GET /api/jobs/[id]
 * 求人詳細（公開中のみ・求職者向け）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const job = await prisma.job.findFirst({
      where: {
        id,
        status: JobStatus.PUBLISHED,
      },
      include: {
        tenant: {
          include: { settings: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: "求人が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("求人詳細取得エラー:", error)
    return NextResponse.json(
      { error: "求人詳細の取得に失敗しました" },
      { status: 500 }
    )
  }
}
