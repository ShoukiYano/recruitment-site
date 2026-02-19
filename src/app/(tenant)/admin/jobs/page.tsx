"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  status: "DRAFT" | "PUBLISHED" | "CLOSED"
  publishedAt: string | null
  createdAt: string
  _count: { applications: number }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "公開中", className: "bg-green-100 text-green-800" },
  DRAFT: { label: "下書き", className: "bg-gray-100 text-gray-600" },
  CLOSED: { label: "募集終了", className: "bg-red-100 text-red-800" },
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/jobs?admin=true")
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs)
      } else {
        toast.error("求人一覧の取得に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleToggleStatus = async (job: Job) => {
    if (job.status === "CLOSED") return
    const newStatus = job.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"

    setTogglingId(job.id)
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : j.publishedAt }
              : j
          )
        )
        toast.success(newStatus === "PUBLISHED" ? "求人を公開しました" : "求人を下書きに戻しました")
      } else {
        toast.error("ステータスの更新に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">求人管理</h1>
        <Link href="/admin/jobs/new">
          <Button className="bg-[#0D9488] hover:bg-[#0D9488]/90">
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">求人一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              読み込み中...
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              求人がありません。「新規作成」から作成してください。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">タイトル</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">ステータス</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">応募数</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">掲載日</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">公開</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const config = statusConfig[job.status]
                    return (
                      <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4">
                          <Badge className={config.className}>{config.label}</Badge>
                        </td>
                        <td className="py-3 px-4">{job._count.applications}件</td>
                        <td className="py-3 px-4 text-gray-500">
                          {job.publishedAt
                            ? new Date(job.publishedAt).toLocaleDateString("ja-JP")
                            : "未公開"}
                        </td>
                        <td className="py-3 px-4">
                          <Switch
                            checked={job.status === "PUBLISHED"}
                            onCheckedChange={() => handleToggleStatus(job)}
                            disabled={job.status === "CLOSED" || togglingId === job.id}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/jobs/${job.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/applicants?jobId=${job.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
