import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
})

/**
 * PATCH /api/users/me
 * ログイン中ユーザーのプロフィール更新（名前）
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = updateSchema.parse(body)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    return NextResponse.json({ message: "更新しました" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("[ユーザー更新]", error)
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 })
  }
}
