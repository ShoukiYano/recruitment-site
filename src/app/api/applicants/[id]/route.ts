import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * GET /api/applicants/[id]
 * 応募詳細取得（自テナントのみ）
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const { id } = await params

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { select: { id: true, title: true } },
        jobSeeker: { select: { id: true, name: true, email: true, phone: true, profile: true } },
        evaluation: {
          select: { rank: true, score: true, breakdown: true, aiComment: true },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 })
    }

    // テナント所有チェック
    if (
      session.user.role !== "SYSTEM_ADMIN" &&
      application.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    return NextResponse.json({ data: application })
  } catch (error) {
    console.error("[応募詳細API] 取得エラー:", error)
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 })
  }
}

const statusSchema = z.object({
  status: z.enum(["NEW", "SCREENING", "INTERVIEW_SCHEDULED", "INTERVIEWED", "OFFERED", "REJECTED"]),
})

/**
 * PATCH /api/applicants/[id]
 * ステータス更新（自テナントのみ）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const { id } = await params

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      select: { tenantId: true },
    })

    if (!application) {
      return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 })
    }

    if (
      session.user.role !== "SYSTEM_ADMIN" &&
      application.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = statusSchema.parse(body)

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("[応募詳細API] ステータス更新エラー:", error)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 })
  }
}
