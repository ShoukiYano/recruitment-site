"use client"

import { useState } from "react"
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

// ランク別バッジ色
const rankColors: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

// ステータス表示設定
const statusOptions = [
  { value: "NEW", label: "新規" },
  { value: "SCREENING", label: "選考中" },
  { value: "INTERVIEW_SCHEDULED", label: "面接予定" },
  { value: "INTERVIEWED", label: "面接済" },
  { value: "OFFERED", label: "内定" },
  { value: "REJECTED", label: "不採用" },
]

// モック: 応募者詳細データ
const mockApplicant = {
  id: "1",
  name: "田中 太郎",
  email: "tanaka@example.com",
  phone: "090-1234-5678",
  jobTitle: "フロントエンドエンジニア",
  status: "INTERVIEW_SCHEDULED",
  appliedAt: "2026-02-18",
  evaluation: {
    rank: "S",
    score: 92,
    breakdown: {
      skillMatch: 95,
      experience: 90,
      education: 85,
      motivation: 92,
      responseQuality: 98,
    },
    aiComment:
      "非常に高いスキルマッチ率を示しています。React/Next.jsの実務経験が5年以上あり、TypeScriptの深い理解が見られます。チームリーダーの経験もあり、即戦力として活躍が期待できます。",
  },
  profile: {
    skills: ["React", "Next.js", "TypeScript", "Node.js", "AWS"],
    experience: "フロントエンド開発 5年、チームリーダー 2年",
    education: "東京工業大学 情報工学科 卒業",
    currentCompany: "株式会社テック",
  },
}

// モック: メッセージスレッド
const mockMessages = [
  {
    id: "m1",
    senderType: "SYSTEM" as const,
    content: "田中 太郎さんがフロントエンドエンジニアに応募しました。",
    sentAt: "2026-02-18 10:00",
  },
  {
    id: "m2",
    senderType: "COMPANY" as const,
    content:
      "田中様、ご応募ありがとうございます。書類選考を通過されましたので、面接の日程を調整させてください。",
    sentAt: "2026-02-18 14:30",
  },
  {
    id: "m3",
    senderType: "JOB_SEEKER" as const,
    content:
      "ご連絡ありがとうございます。来週の火曜日か水曜日の午後であれば対応可能です。",
    sentAt: "2026-02-18 16:45",
  },
]

export default function ApplicantDetailPage() {
  const params = useParams()
  const [status, setStatus] = useState(mockApplicant.status)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)

  // ステータス変更ハンドラ
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    // TODO: PUT /api/applicants/[id]/status
  }

  // メッセージ送信ハンドラ
  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: `m${prev.length + 1}`,
        senderType: "COMPANY" as const,
        content: newMessage,
        sentAt: new Date().toLocaleString("ja-JP"),
      },
    ])
    setNewMessage("")
  }

  const { evaluation, profile } = mockApplicant

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
          <h1 className="text-2xl font-bold text-gray-900">
            {mockApplicant.name}
          </h1>
        </div>
        {/* ステータス変更 */}
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
        {/* 左カラム: AI評価 + 応募者情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI評価 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI評価</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={`${rankColors[evaluation.rank]} text-2xl px-4 py-2`}>
                  {evaluation.rank}
                </Badge>
                <div>
                  <p className="text-3xl font-bold">{evaluation.score}点</p>
                  <p className="text-sm text-gray-500">総合スコア</p>
                </div>
              </div>

              {/* 評価内訳バー */}
              <div className="space-y-3">
                {Object.entries(evaluation.breakdown).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    skillMatch: "スキルマッチ",
                    experience: "経験",
                    education: "学歴",
                    motivation: "志望度",
                    responseQuality: "文章力",
                  }
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{labels[key]}</span>
                        <span className="font-medium">{value}点</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0D9488] h-2 rounded-full transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* AIコメント */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">AIコメント</p>
                <p className="text-sm text-gray-600">{evaluation.aiComment}</p>
              </div>
            </CardContent>
          </Card>

          {/* 応募者情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">応募者情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">氏名</dt>
                  <dd className="font-medium mt-1">{mockApplicant.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">メール</dt>
                  <dd className="font-medium mt-1">{mockApplicant.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">電話番号</dt>
                  <dd className="font-medium mt-1">{mockApplicant.phone}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">応募求人</dt>
                  <dd className="font-medium mt-1">{mockApplicant.jobTitle}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">現在の勤務先</dt>
                  <dd className="font-medium mt-1">{profile.currentCompany}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">学歴</dt>
                  <dd className="font-medium mt-1">{profile.education}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">経歴</dt>
                  <dd className="font-medium mt-1">{profile.experience}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">スキル</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* 右カラム: メッセージスレッド */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="shrink-0">
              <CardTitle className="text-lg">メッセージ</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              {/* メッセージ一覧 */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                {messages.map((msg) => {
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
                            isCompany
                              ? "bg-[#0D9488] text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isCompany ? "text-white/70" : "text-gray-400"
                            }`}
                          >
                            {msg.sentAt}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* メッセージ入力 */}
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
