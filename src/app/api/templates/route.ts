import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// テンプレート一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rank = searchParams.get("rank")

    // クエリパラメータ or セッションからtenantIdを取得
    let tenantId = searchParams.get("tenantId")
    if (!tenantId) {
      const session = await getServerSession(authOptions)
      tenantId = session?.user?.tenantId ?? null
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantIdは必須です" },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { tenantId }
    if (rank) {
      // "ALL"の場合はnull（共通テンプレート）を検索
      where.rank = rank === "ALL" ? null : rank
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("テンプレート取得エラー:", error)
    return NextResponse.json(
      { error: "テンプレートの取得に失敗しました" },
      { status: 500 }
    )
  }
}

// テンプレート作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const tenantId = session?.user?.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await request.json()
    const { name, rank, subject, body: templateBody } = body

    if (!name || !templateBody) {
      return NextResponse.json(
        { error: "テンプレート名と本文は必須です" },
        { status: 400 }
      )
    }

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId,
        name,
        rank: rank === "ALL" || rank === "null" || !rank ? null : rank,
        subject: subject || null,
        body: templateBody,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("テンプレート作成エラー:", error)
    return NextResponse.json(
      { error: "テンプレートの作成に失敗しました" },
      { status: 500 }
    )
  }
}
