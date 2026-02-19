"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Briefcase, LogIn, User, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { JobCard } from "@/components/jobseeker/JobCard"
import { JobSearchBar } from "@/components/jobseeker/JobSearchBar"

// SelectTrigger の aria-controls ID がSSR/クライアント間でズレるため ssr: false
const JobFilters = dynamic(
  () => import("@/components/jobseeker/JobFilters").then((m) => m.JobFilters),
  { ssr: false }
)

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
  requirements: any
  tenant: {
    name: string
    settings?: {
      logoUrl: string | null
    } | null
  }
}

interface JobsResponse {
  jobs: Job[]
  total: number
  page: number
  totalPages: number
}

// 求人一覧ページ
export default function JobsPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // 求人データ取得
  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (keyword) params.set("keyword", keyword)
      if (location && location !== "all") params.set("location", location)
      if (employmentType && employmentType !== "all") params.set("employmentType", employmentType)
      params.set("page", page.toString())
      params.set("limit", "12")

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data: JobsResponse = await res.json()
        setJobs(data.jobs)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("求人取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }, [keyword, location, employmentType, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword)
    setPage(1)
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    setPage(1)
  }

  const handleEmploymentTypeChange = (value: string) => {
    setEmploymentType(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <Link href="/jobs" className="flex items-center gap-2">
              <Briefcase className="size-6 text-[#0D9488]" />
              <span className="text-lg font-bold text-gray-900">
                AI採用プラットフォーム
              </span>
            </Link>

            {/* ナビゲーション */}
            <nav className="flex items-center gap-2">
              <Link href="/jobs">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  求人検索
                </Button>
              </Link>
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
                    <Button
                      size="sm"
                      className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
                    >
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
              あなたに合った求人を見つけよう
            </h1>
            <p className="text-gray-500">
              {total > 0 ? `${total}件の求人が見つかりました` : "求人を検索してください"}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <JobSearchBar defaultValue={keyword} onSearch={handleSearch} />
            <JobFilters
              location={location}
              employmentType={employmentType}
              onLocationChange={handleLocationChange}
              onEmploymentTypeChange={handleEmploymentTypeChange}
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
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  前へ
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={
                          page === pageNum
                            ? "bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
                            : ""
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  次へ
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="size-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              求人が見つかりませんでした
            </h3>
            <p className="text-gray-500">
              検索条件を変更して再度お試しください
            </p>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; 2026 AI採用プラットフォーム All rights reserved.
        </div>
      </footer>
    </div>
  )
}
