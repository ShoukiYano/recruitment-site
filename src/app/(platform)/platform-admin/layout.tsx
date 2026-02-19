"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Package,
  Settings,
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

const navItems = [
  { href: "/platform-admin/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/platform-admin/tenants",   label: "テナント管理",  icon: Building2 },
  { href: "/platform-admin/billing",   label: "課金・請求",    icon: Receipt },
  { href: "/platform-admin/plans",     label: "プラン管理",    icon: Package },
  { href: "/platform-admin/settings",  label: "システム設定",  icon: Settings },
]

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name ?? "管理者"
  const userInitial = userName.charAt(0)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* サイドバー */}
      <aside className="w-64 bg-[#1E3A5F] text-white flex flex-col">
        <div className="p-6 border-b border-[#2d5480]">
          <h1 className="text-lg font-bold">運営管理システム</h1>
          <p className="text-xs text-blue-300 mt-1">AI採用プラットフォーム</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/platform-admin/dashboard" &&
                pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-blue-100 hover:bg-[#2d5480] hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
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
          <span className="text-white font-semibold text-sm">運営管理</span>

          {/* ユーザーメニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/20 text-white text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>
                <User className="h-4 w-4 mr-2" />
                {session?.user?.email ?? ""}
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
        </header>

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
