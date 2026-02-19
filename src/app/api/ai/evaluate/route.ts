import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { runEvaluation } from "@/lib/ai/evaluation-service"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 })
  const { applicationId } = await request.json()
  if (!applicationId) return NextResponse.json({ error: "applicationIdが必要です" }, { status: 400 })
  try {
    await runEvaluation(applicationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "AI評価に失敗しました" }, { status: 500 })
  }
}
