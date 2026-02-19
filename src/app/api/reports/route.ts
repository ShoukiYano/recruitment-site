import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobId, reason, detail } = body

    if (!jobId || !reason) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // 有効な通報理由かチェック
    const validReasons = ["FALSE_INFO", "DISCRIMINATORY", "FRAUD", "LABOR_VIOLATION", "OTHER"]
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "無効な通報理由です" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const reporterId = session?.user?.id ?? null

    await prisma.report.create({
      data: {
        jobId,
        reason,
        detail: detail || null,
        reporterId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Report error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
