"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  MessageCircle,
  User,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  CalendarCheck,
} from "lucide-react"

interface Application {
  id: string
  status: string
  appliedAt: string
  job: {
    title: string
    tenant: { name: string }
  }
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  NEW: { label: "新規応募", icon: Clock, color: "text-blue-500" },
  SCREENING: { label: "書類選考中", icon: Clock, color: "text-yellow-500" },
  INTERVIEW_SCHEDULED: { label: "面接予定", icon: CalendarCheck, color: "text-purple-500" },
  INTERVIEWED: { label: "面接済", icon: CalendarCheck, color: "text-indigo-500" },
  OFFERED: { label: "内定", icon: CheckCircle, color: "text-green-500" },
  REJECTED: { label: "不採用", icon: XCircle, color: "text-red-500" },
}

/**
 * 求職者マイページ
 */
export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchApplications()
      fetchUnreadCount()
    }
  }, [session])

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications/me")
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("応募履歴取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/messages/unread-count")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count)
      }
    } catch {}
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  // ステータス別集計
  const newCount = applications.filter((a) => a.status === "NEW").length
  const screeningCount = applications.filter((a) => a.status === "SCREENING").length
  const interviewCount = applications.filter(
    (a) => a.status === "INTERVIEW_SCHEDULED" || a.status === "INTERVIEWED"
  ).length
  const offeredCount = applications.filter((a) => a.status === "OFFERED").length

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/jobs" className="flex items-center gap-2">
              <Briefcase className="size-6 text-[#0D9488]" />
              <span className="text-lg font-bold text-gray-900">採用プラットフォーム</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{session.user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/jobs" })}
                className="text-gray-500"
              >
                <LogOut className="size-4 mr-1" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* サイドバー */}
          <aside className="w-48 shrink-0">
            <nav className="space-y-1">
              <Link
                href="/mypage"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#0D9488]/10 text-[#0D9488]"
              >
                <User className="size-4" />
                マイページ
              </Link>
              <Link
                href="/mypage/messages"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 relative"
              >
                <MessageCircle className="size-4" />
                メッセージ
                {unreadCount > 0 && (
                  <span className="absolute right-2 bg-[#0D9488] text-white text-xs rounded-full px-1.5 min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <div className="flex-1 space-y-6">
            <h1 className="text-xl font-bold text-gray-900">マイページ</h1>

            {/* サマリー */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "新規応募", count: newCount, color: "text-blue-600" },
                { label: "書類選考中", count: screeningCount, color: "text-yellow-600" },
                { label: "面接", count: interviewCount, color: "text-purple-600" },
                { label: "内定", count: offeredCount, color: "text-green-600" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 応募履歴 */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">応募履歴</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                  <Briefcase className="size-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">まだ応募した求人はありません</p>
                  <Link href="/jobs">
                    <Button variant="link" className="mt-2 text-[#0D9488]">
                      求人を探す
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const statusInfo = STATUS_CONFIG[app.status]
                    const StatusIcon = statusInfo?.icon ?? Clock
                    return (
                      <Card key={app.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{app.job.title}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{app.job.tenant.name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <StatusIcon className={`size-3.5 ${statusInfo?.color ?? "text-gray-500"}`} />
                                <span className="text-xs text-gray-600">{statusInfo?.label ?? app.status}</span>
                              </div>
                            </div>
                            <time className="text-xs text-gray-400 shrink-0">
                              {new Date(app.appliedAt).toLocaleDateString("ja-JP")}
                            </time>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
