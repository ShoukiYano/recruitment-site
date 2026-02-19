"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"

// ランク別バッジ色
const rankColors: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

const statusOptions = [
  { value: "NEW", label: "新規" },
  { value: "SCREENING", label: "選考中" },
  { value: "INTERVIEW_SCHEDULED", label: "面接予定" },
  { value: "INTERVIEWED", label: "面接済" },
  { value: "OFFERED", label: "内定" },
  { value: "REJECTED", label: "不採用" },
]

const breakdownLabels: Record<string, string> = {
  skillMatch: "スキルマッチ",
  experience: "経験",
  education: "学歴",
  motivation: "志望度",
  responseQuality: "文章力",
}

// 応募フォームの選択肢ラベル
const educationLabels: Record<string, string> = {
  high_school: "高等学校卒業",
  vocational: "専門学校卒業",
  associate: "短期大学卒業",
  bachelor: "大学卒業",
  master: "大学院修了（修士）",
  doctor: "大学院修了（博士）",
}

const employmentStatusLabels: Record<string, string> = {
  employed: "在職中",
  unemployed: "離職中",
  freelance: "フリーランス",
  student: "学生",
}

const experienceYearsLabels: Record<string, string> = {
  "0": "未経験",
  "1-2": "1〜2年",
  "3-5": "3〜5年",
  "6-9": "6〜9年",
  "10+": "10年以上",
}

type FormData = {
  lastName?: string
  firstName?: string
  lastNameKana?: string
  firstNameKana?: string
  email?: string
  phone?: string
  birthDate?: string
  education?: string
  employmentStatus?: string
  experienceYears?: string
  jobCategory?: string
  selfPR?: string
  motivation?: string
}

type ApplicationDetail = {
  id: string
  status: string
  appliedAt: string
  formData: FormData
  job: { id: string; title: string }
  jobSeeker: {
    id: string
    name: string
    email: string
  }
  evaluation: {
    rank: string
    score: number
    breakdown: Record<string, number>
    aiComment: string
  } | null
}

type Message = {
  id: string
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
  content: string
  sentAt: string
  isAutoReply: boolean
  senderName: string | null
}

function InfoRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium mt-1">{value}</dd>
    </div>
  )
}

export default function ApplicantDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const [appRes, msgRes] = await Promise.all([
        fetch(`/api/applicants/${id}`),
        fetch(`/api/messages/${id}`),
      ])
      const appJson = await appRes.json()
      const msgJson = await msgRes.json()

      if (appRes.ok && appJson.data) {
        setApplication(appJson.data)
        setStatus(appJson.data.status)
      }
      if (msgRes.ok && Array.isArray(msgJson)) {
        setMessages(msgJson)
      }
    } catch (error) {
      console.error("データ取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    try {
      const res = await fetch(`/api/applicants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        toast.error("ステータスの更新に失敗しました")
        setStatus(application?.status ?? newStatus)
      }
    } catch {
      toast.error("エラーが発生しました")
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return
    setIsSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, content: newMessage }),
      })
      if (res.ok) {
        setNewMessage("")
        const msgRes = await fetch(`/api/messages/${id}`)
        if (msgRes.ok) {
          const msgJson = await msgRes.json()
          if (Array.isArray(msgJson)) setMessages(msgJson)
        }
      } else {
        toast.error("メッセージの送信に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) return <div className="text-gray-500 p-6">読み込み中...</div>
  if (!application) return <div className="text-red-500 p-6">応募データが見つかりません</div>

  const { jobSeeker, job, evaluation, formData } = application
  const fullName = formData.lastName && formData.firstName
    ? `${formData.lastName} ${formData.firstName}`
    : jobSeeker.name
  const fullNameKana = formData.lastNameKana && formData.firstNameKana
    ? `${formData.lastNameKana} ${formData.firstNameKana}`
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/applicants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI評価 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI評価</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluation ? (
                <>
                  <div className="flex items-center gap-4">
                    <Badge className={`${rankColors[evaluation.rank] ?? ""} text-2xl px-4 py-2`}>
                      {evaluation.rank}
                    </Badge>
                    <div>
                      <p className="text-3xl font-bold">{Math.round(evaluation.score)}点</p>
                      <p className="text-sm text-gray-500">総合スコア</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(evaluation.breakdown).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{breakdownLabels[key] ?? key}</span>
                          <span className="font-medium">{Math.round(value)}点</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0D9488] h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">AIコメント</p>
                    <p className="text-sm text-gray-600">{evaluation.aiComment}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">まだAI評価が実行されていません</p>
              )}
            </CardContent>
          </Card>

          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoRow label="氏名" value={fullName} />
                <InfoRow label="フリガナ" value={fullNameKana} />
                <InfoRow label="メールアドレス" value={formData.email ?? jobSeeker.email} />
                <InfoRow label="電話番号" value={formData.phone} />
                <InfoRow label="生年月日" value={formData.birthDate} />
                <InfoRow label="応募求人" value={job.title} />
                <InfoRow label="応募日" value={application.appliedAt.split("T")[0]} />
              </dl>
            </CardContent>
          </Card>

          {/* 職務経歴 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">職務経歴</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoRow
                  label="最終学歴"
                  value={formData.education ? educationLabels[formData.education] ?? formData.education : undefined}
                />
                <InfoRow
                  label="就業状況"
                  value={formData.employmentStatus ? employmentStatusLabels[formData.employmentStatus] ?? formData.employmentStatus : undefined}
                />
                <InfoRow
                  label="経験年数"
                  value={formData.experienceYears ? experienceYearsLabels[formData.experienceYears] ?? formData.experienceYears : undefined}
                />
                <InfoRow label="職種" value={formData.jobCategory} />
              </dl>
            </CardContent>
          </Card>

          {/* 自己PR・志望動機 */}
          {(formData.selfPR || formData.motivation) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">自己PR・志望動機</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {formData.selfPR && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">自己PR</p>
                    <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{formData.selfPR}</p>
                  </div>
                )}
                {formData.motivation && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">志望動機</p>
                    <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{formData.motivation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右カラム: メッセージスレッド */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="shrink-0">
              <CardTitle className="text-lg">メッセージ</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              <div className="flex-1 overflow-y-auto px-4 space-y-3 py-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center mt-8">まだメッセージはありません</p>
                ) : (
                  messages.map((msg) => {
                    const isCompany = msg.senderType === "COMPANY"
                    const isSystem = msg.senderType === "SYSTEM"
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCompany ? "justify-end" : "justify-start"}`}
                      >
                        {isSystem ? (
                          <div className="w-full text-center">
                            <p className="text-xs text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full">
                              {msg.content}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 ${
                              isCompany ? "bg-[#0D9488] text-white" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isCompany ? "text-white/70" : "text-gray-400"}`}>
                              {new Date(msg.sentAt).toLocaleString("ja-JP")}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="shrink-0 border-t p-3 flex gap-2">
                <Input
                  placeholder="メッセージを入力..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="bg-[#0D9488] hover:bg-[#0D9488]/90"
                  onClick={handleSendMessage}
                  disabled={isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
