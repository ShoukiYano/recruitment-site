import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { JobStatus, EmploymentType } from "@prisma/client"
import { z } from "zod"

const createJobSchema = z.object({
  title: z.string().min(1, "求人タイトルは必須です"),
  employmentType: z.nativeEnum(EmploymentType),
  location: z.string().optional().nullable(),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  description: z.string().min(1, "仕事内容は必須です"),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
})

/**
 * POST /api/jobs
 * 求人新規作成（TENANT_ADMIN / TENANT_USER のみ）
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }
  if (!session.user.tenantId) {
    return NextResponse.json({ error: "テナント情報が見つかりません" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = createJobSchema.parse(body)

    const job = await prisma.job.create({
      data: {
        tenantId: session.user.tenantId,
        title: data.title,
        description: data.description,
        employmentType: data.employmentType,
        location: data.location ?? undefined,
        salaryMin: data.salaryMin ?? undefined,
        salaryMax: data.salaryMax ?? undefined,
        requirements: data.requirements ?? undefined,
        benefits: data.benefits ?? undefined,
        status: JobStatus.DRAFT,
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("求人作成エラー:", error)
    return NextResponse.json({ error: "求人の作成に失敗しました" }, { status: 500 })
  }
}

/**
 * GET /api/jobs
 * - admin=true の場合: 認証済みテナントの全ステータス求人を返す（管理画面用）
 * - それ以外: 公開中(PUBLISHED)のみ返す（求職者向け）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get("admin") === "true"
    const keyword = searchParams.get("keyword") || ""
    const location = searchParams.get("location") || ""
    const employmentType = searchParams.get("employmentType") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    if (isAdmin) {
      const session = await getServerSession(authOptions)
      if (!session?.user || !session.user.tenantId) {
        return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
      }

      const where: Record<string, unknown> = { tenantId: session.user.tenantId }
      if (keyword) {
        where.OR = [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ]
      }
      if (employmentType) where.employmentType = employmentType

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: { _count: { select: { applications: true } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.job.count({ where }),
      ])

      return NextResponse.json({
        jobs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    }

    // 公開モード（求職者向け）
    const where = {
      status: JobStatus.PUBLISHED,
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
      ...(location && { location: { contains: location } }),
      ...(employmentType && { employmentType: employmentType as any }),
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { tenant: { include: { settings: true } } },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("求人一覧取得エラー:", error)
    return NextResponse.json(
      { error: "求人一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}
