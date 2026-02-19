"use client"

import Link from "next/link"
import { MapPin, Banknote, Clock, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// 雇用形態の日本語ラベル
const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "正社員",
  PART_TIME: "パートタイム",
  CONTRACT: "契約社員",
  FREELANCE: "フリーランス",
  INTERNSHIP: "インターン",
}

interface JobCardProps {
  job: {
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
}

// 年収表示のフォーマット
function formatSalary(min: number | null, max: number | null): string {
  if (min && max) return `${min}万〜${max}万円`
  if (min) return `${min}万円〜`
  if (max) return `〜${max}万円`
  return "応相談"
}

export function JobCard({ job }: JobCardProps) {
  // スキルタグの抽出（requirementsから）
  const skills: string[] = Array.isArray(job.requirements?.skills)
    ? job.requirements.skills.slice(0, 5)
    : []

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="h-full gap-4 bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
        <CardContent className="p-5">
          {/* 企業名 */}
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="size-4 text-gray-400" />
            <span className="text-sm text-gray-500">{job.tenant.name}</span>
          </div>

          {/* 求人タイトル */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
            {job.title}
          </h3>

          {/* メタ情報 */}
          <div className="space-y-2 mb-4">
            {job.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="size-4 text-gray-400 shrink-0" />
                <span>
                  {job.location}
                  {job.isRemote && " / リモート可"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Banknote className="size-4 text-gray-400 shrink-0" />
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="size-4 text-gray-400 shrink-0" />
              <span>{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
            </div>
          </div>

          {/* スキルタグ */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs bg-[#0D9488]/10 text-[#0D9488] border-0"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
