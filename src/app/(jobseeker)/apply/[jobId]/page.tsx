"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApplicationForm } from "@/components/jobseeker/ApplicationForm"

interface Job {
  id: string
  title: string
  tenant: {
    name: string
  }
}

// 応募ページ
export default function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (!res.ok) {
          setError("求人が見つかりませんでした")
          return
        }
        const data = await res.json()
        setJob(data)
      } catch {
        setError("求人の取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, formData }),
      })

      if (res.status === 401) {
        // 未ログインの場合
        router.push(`/mypage?redirect=/apply/${jobId}`)
        return
      }

      if (res.status === 409) {
        setError("この求人には既に応募済みです")
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "応募に失敗しました")
        return
      }

      setIsComplete(true)
    } catch {
      setError("応募の送信に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || "求人が見つかりません"}</p>
        <Link href="/jobs">
          <Button variant="outline">求人一覧に戻る</Button>
        </Link>
      </div>
    )
  }

  // 応募完了画面
  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/jobs" className="flex items-center gap-2">
                <Briefcase className="size-6 text-[#0D9488]" />
                <span className="text-lg font-bold text-gray-900">
                  AI採用プラットフォーム
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="size-16 text-[#0D9488] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            応募が完了しました
          </h1>
          <p className="text-gray-600 mb-2">
            「{job.title}」への応募を受け付けました。
          </p>
          <p className="text-gray-500 text-sm mb-8">
            選考結果はメッセージまたはメールにてお知らせいたします。
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/jobs">
              <Button variant="outline">求人一覧へ</Button>
            </Link>
            <Link href="/mypage">
              <Button className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white">
                マイページへ
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/jobs" className="flex items-center gap-2">
              <Briefcase className="size-6 text-[#0D9488]" />
              <span className="text-lg font-bold text-gray-900">
                AI採用プラットフォーム
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">応募フォーム</h1>
        <p className="text-gray-500 mb-8">
          以下のフォームに必要事項を入力して応募してください
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <ApplicationForm
          jobTitle={job.title}
          companyName={job.tenant.name}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  )
}
