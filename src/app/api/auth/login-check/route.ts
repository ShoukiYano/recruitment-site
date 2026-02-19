import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

// ログイン前のレート制限チェックエンドポイント
// ログインフォームのsubmit前にこのAPIを呼び出してレート制限を確認する
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  // 1分間に10回まで
  const { allowed, remaining } = checkRateLimit(`login:${ip}`, 10, 60_000)

  if (!allowed) {
    return NextResponse.json(
      { error: "リクエスト回数が多すぎます。しばらく待ってから再試行してください。" },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    )
  }

  return NextResponse.json({ allowed: true, remaining })
}
