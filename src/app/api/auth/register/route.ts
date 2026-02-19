import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  phone: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // メールアドレスの重複チェック
    const existing = await prisma.jobSeeker.findUnique({
      where: { email: validated.email },
    })
    if (existing) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" },
        { status: 400 }
      )
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(validated.password, 12)

    // 求職者作成
    await prisma.jobSeeker.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        phone: validated.phone,
      },
    })

    return NextResponse.json(
      { message: "登録が完了しました" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "登録処理でエラーが発生しました" },
      { status: 500 }
    )
  }
}
