import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateTemplate, deleteTemplate } from "@/lib/services/template-service"
import { z } from "zod"
import { AIRank } from "@prisma/client"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  rank: z.enum(["S", "A", "B", "C"]).nullable().optional(),
  subject: z.string().nullable().optional(),
  body: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

/**
 * PUT /api/templates/[id]
 * テンプレート更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 })
  }

  try {
    const { id } = await params

    // テンプレートが自テナントのものかチェック
    const template = await prisma.messageTemplate.findUnique({
      where: { id },
      select: { tenantId: true },
    })
    if (!template) {
      return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 })
    }
    if (
      session.user.role !== "SYSTEM_ADMIN" &&
      template.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    const updated = await updateTemplate(id, {
      ...data,
      rank: data.rank === undefined ? undefined : (data.rank as AIRank | null),
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("[テンプレートAPI] 更新エラー:", error)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 })
  }
}

/**
 * DELETE /api/templates/[id]
 * テンプレート削除
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 })
  }

  try {
    const { id } = await params

    // テンプレートが自テナントのものかチェック
    const template = await prisma.messageTemplate.findUnique({
      where: { id },
      select: { tenantId: true },
    })
    if (!template) {
      return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 })
    }
    if (
      session.user.role !== "SYSTEM_ADMIN" &&
      template.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    await deleteTemplate(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[テンプレートAPI] 削除エラー:", error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 })
  }
}
