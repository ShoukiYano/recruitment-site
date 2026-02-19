"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// サイドバーナビゲーション項目
const navItems = [
  { href: "/admin/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "求人管理", icon: Briefcase },
  { href: "/admin/applicants", label: "応募者一覧", icon: Users },
  { href: "/admin/messages", label: "メッセージ", icon: MessageSquare },
  { href: "/admin/templates", label: "テンプレート", icon: FileText },
  { href: "/admin/settings/ai", label: "設定", icon: Settings },
]

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const userName = session?.user?.name ?? "管理者"
  const userInitial = userName.charAt(0)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* サイドバー */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#1E3A5F]">採用管理</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#0D9488]/10 text-[#0D9488]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="h-14 bg-[#1E3A5F] flex items-center justify-between px-6 shrink-0">
          <h1 className="text-white font-semibold">株式会社サンプル</h1>
          <div className="flex items-center gap-4">
            {/* 通知アイコン */}
            <button className="relative text-white/80 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* ユーザーメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#0D9488] text-white text-xs">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/admin/settings/users")}>
                  <User className="h-4 w-4 mr-2" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/settings/ai")}>
                  <Settings className="h-4 w-4 mr-2" />
                  アカウント設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => signOut({ callbackUrl: "/admin-login" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
