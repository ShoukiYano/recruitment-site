"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { Briefcase, ChevronLeft, ChevronRight, LogIn, User, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { JobCard } from "@/components/jobseeker/JobCard"
import { JobSearchBar } from "@/components/jobseeker/JobSearchBar"

interface TenantInfo {
  name: string
  logoUrl: string | null
}

interface Job {
  id: string
  title: string
  description: string
  location: string | null
  employmentType: string
  salaryMin: number | null
  salaryMax: number | null
  isRemote: boolean
  publishedAt: string | null
  requirements: unknown
  tenant: {
    name: string
    settings?: { logoUrl: string | null } | null
  }
}

export default function TenantJobsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = use(params)
  const { data: session } = useSession()

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // テナント情報取得
  useEffect(() => {
    fetch(`/api/public/tenant/${subdomain}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) { setNotFound(true); return }
        setTenantInfo({ name: json.name, logoUrl: json.logoUrl ?? null })
      })
      .catch(() => setNotFound(true))
  }, [subdomain])

  // 求人一覧取得
  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ subdomain, page: page.toString(), limit: "12" })
      if (keyword) params.set("keyword", keyword)
      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("求人取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }, [subdomain, keyword, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">採用ページが見つかりません</p>
        <Link href="/jobs"><Button variant="outline">求人一覧へ</Button></Link>
      </div>
    )
  }

  const companyName = tenantInfo?.name ?? ""

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/t/${subdomain}/jobs`} className="flex items-center gap-2">
              <Briefcase className="size-6 text-[#0D9488]" />
              <span className="text-lg font-bold text-gray-900">
                {companyName ? `${companyName} 採用情報` : "採用情報"}
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              {session ? (
                <Link href="/mypage">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <User className="size-4" />
                    マイページ
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <LogIn className="size-4" />
                      ログイン
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white">
                      <UserPlus className="size-4" />
                      新規登録
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 検索セクション */}
      <section className="bg-gradient-to-b from-[#0D9488]/5 to-[#F9FAFB] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {companyName ? `${companyName}の求人` : "求人一覧"}
            </h1>
            <p className="text-gray-500">
              {total > 0 ? `${total}件の求人が見つかりました` : "現在募集中の求人はありません"}
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <JobSearchBar
              defaultValue={keyword}
              onSearch={(v) => { setKeyword(v); setPage(1) }}
            />
          </div>
        </div>
      </section>

      {/* 求人一覧 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  detailHref={`/t/${subdomain}/jobs/${job.id}`}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="size-4" />前へ
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={page === p ? "bg-[#0D9488] hover:bg-[#0D9488]/90 text-white" : ""}
                    >
                      {p}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  次へ<ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="size-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">現在募集中の求人はありません</h3>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          {companyName && <p className="font-medium text-gray-700 mb-1">{companyName}</p>}
          &copy; 2026 All rights reserved.
        </div>
      </footer>
    </div>
  )
}
