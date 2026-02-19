"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// 雇用形態の選択肢
const employmentTypes = [
  { value: "FULL_TIME", label: "正社員" },
  { value: "PART_TIME", label: "パートタイム" },
  { value: "CONTRACT", label: "契約社員" },
  { value: "FREELANCE", label: "フリーランス" },
  { value: "INTERNSHIP", label: "インターン" },
]

// モックデータ（既存求人）
const mockJob = {
  id: "1",
  title: "フロントエンドエンジニア",
  employmentType: "FULL_TIME",
  location: "東京都渋谷区",
  salaryMin: 500,
  salaryMax: 800,
  description: "React/Next.jsを活用したWebアプリケーションの開発を担当していただきます。",
  requirements: "React 3年以上の経験\nTypeScriptの実務経験\nチーム開発の経験",
  benefits: "リモートワーク可\nフレックスタイム制\n書籍購入補助",
}

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(mockJob)

  // 既存データの取得（実際にはAPIから取得）
  useEffect(() => {
    // TODO: GET /api/jobs/[id] からデータを取得
    // 現在はモックデータを使用
  }, [params.id])

  const handleChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.push("/admin/jobs")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">求人を編集</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>求人情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div className="space-y-2">
              <Label htmlFor="title">求人タイトル *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            {/* 雇用形態 */}
            <div className="space-y-2">
              <Label>雇用形態 *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(v) => handleChange("employmentType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 勤務地 */}
            <div className="space-y-2">
              <Label htmlFor="location">勤務地</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            {/* 年収 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">年収下限（万円）</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleChange("salaryMin", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">年収上限（万円）</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleChange("salaryMax", Number(e.target.value))}
                />
              </div>
            </div>

            {/* 仕事内容 */}
            <div className="space-y-2">
              <Label htmlFor="description">仕事内容 *</Label>
              <textarea
                id="description"
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>

            {/* 応募資格・スキル */}
            <div className="space-y-2">
              <Label htmlFor="requirements">応募資格・必要スキル</Label>
              <textarea
                id="requirements"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
              />
            </div>

            {/* 福利厚生 */}
            <div className="space-y-2">
              <Label htmlFor="benefits">待遇・福利厚生</Label>
              <textarea
                id="benefits"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.benefits}
                onChange={(e) => handleChange("benefits", e.target.value)}
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-3">
              <Link href="/admin/jobs">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#0D9488] hover:bg-[#0D9488]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "保存中..." : "変更を保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
