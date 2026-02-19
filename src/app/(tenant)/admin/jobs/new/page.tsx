"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function NewJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      employmentType: formData.get("employmentType"),
      location: formData.get("location"),
      salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null,
      salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null,
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      benefits: formData.get("benefits"),
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        <h1 className="text-2xl font-bold text-gray-900">求人を作成</h1>
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
                name="title"
                placeholder="例: フロントエンドエンジニア"
                required
              />
            </div>

            {/* 雇用形態 */}
            <div className="space-y-2">
              <Label htmlFor="employmentType">雇用形態 *</Label>
              <Select name="employmentType" required>
                <SelectTrigger>
                  <SelectValue placeholder="雇用形態を選択" />
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
                name="location"
                placeholder="例: 東京都渋谷区"
              />
            </div>

            {/* 年収 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">年収下限（万円）</Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  placeholder="400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">年収上限（万円）</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  placeholder="800"
                />
              </div>
            </div>

            {/* 仕事内容 */}
            <div className="space-y-2">
              <Label htmlFor="description">仕事内容 *</Label>
              <textarea
                id="description"
                name="description"
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="仕事内容を入力してください"
                required
              />
            </div>

            {/* 応募資格・スキル */}
            <div className="space-y-2">
              <Label htmlFor="requirements">応募資格・必要スキル</Label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="応募資格や必要スキルを入力してください"
              />
            </div>

            {/* 福利厚生 */}
            <div className="space-y-2">
              <Label htmlFor="benefits">待遇・福利厚生</Label>
              <textarea
                id="benefits"
                name="benefits"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="待遇・福利厚生を入力してください"
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
                {isSubmitting ? "作成中..." : "求人を作成"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
