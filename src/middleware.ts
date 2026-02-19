import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ─── IPホワイトリスト ───────────────────────────────────────────
// SYSTEM_ADMIN_IP_WHITELIST : /admin-login, /platform-admin/* に適用（Tailscale IP）
// テナント管理エリアはIP制限なし
const SYSTEM_ADMIN_IP_WHITELIST = (process.env.SYSTEM_ADMIN_IP_WHITELIST ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

/** リクエストのクライアントIPを取得（プロキシ環境対応） */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "127.0.0.1"
  // IPv4-mapped IPv6 (::ffff:1.2.3.4) を正規化
  return ip.replace(/^::ffff:/, "")
}

/** システム管理エリアか判定（運営者専用） */
function isSystemAdminArea(pathname: string): boolean {
  return pathname.startsWith("/platform-admin") || pathname === "/admin-login"
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // ─── IPホワイトリストチェック（システム管理エリアのみ） ──────
    if (SYSTEM_ADMIN_IP_WHITELIST.length > 0 && isSystemAdminArea(pathname)) {
      const clientIp = getClientIp(req)
      if (!SYSTEM_ADMIN_IP_WHITELIST.includes(clientIp)) {
        return NextResponse.redirect(new URL("/access-denied", req.url))
      }
    }

    // ─── ロールベースアクセス制御 ─────────────────────────────────

    // 運営管理画面はSYSTEM_ADMINのみ
    if (pathname.startsWith("/platform-admin")) {
      if (token?.role !== "SYSTEM_ADMIN") {
        return NextResponse.redirect(new URL("/admin-login", req.url))
      }
    }

    // テナント管理画面はTENANT_ADMIN/TENANT_USER/SYSTEM_ADMINに許可
    if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
      if (
        token?.role !== "TENANT_ADMIN" &&
        token?.role !== "TENANT_USER" &&
        token?.role !== "SYSTEM_ADMIN"
      ) {
        return NextResponse.redirect(new URL("/admin-login", req.url))
      }
    }

    // マイページは求職者のみ
    if (pathname.startsWith("/mypage")) {
      if (token?.role !== "JOB_SEEKER") {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // 認証が必要なルート
        if (
          pathname.startsWith("/platform-admin") ||
          (pathname.startsWith("/admin") && pathname !== "/admin-login") ||
          pathname.startsWith("/mypage")
        ) {
          return !!token
        }
        // /admin-login, /t/*/login, /access-denied はログインページ・公開ページ
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/platform-admin/:path*",
    "/admin/:path*",
    "/admin-login",
    "/mypage/:path*",
    "/t/:subdomain/login",
  ],
}
