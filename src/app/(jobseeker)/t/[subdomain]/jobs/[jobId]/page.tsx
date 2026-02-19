"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Briefcase, MapPin, Banknote, Clock, Building2, ChevronRight, Globe, CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "正社員",
  PART_TIME: "パートタイム",
  CONTRACT: "契約社員",
  FREELANCE: "フリーランス",
  INTERNSHIP: "インターン",
}

function formatSalary(min: number | null, max: number | null): string {
  if (min && max) return `${min}万〜${max}万円`
  if (min) return `${min}万円〜`
  if (max) return `〜${max}万円`
  return "応相談"
}

interface JobDetail {
  id: string
  title: string
  description: string
  requirements: { required?: string[]; preferred?: string[]; skills?: string[] } | null
  benefits: string[] | { items?: string[] } | null
  location: string | null
  employmentType: string
  salaryMin: number | null
  salaryMax: number | null
  isRemote: boolean
  publishedAt: string | null
  tenant: { id: string; name: string; settings?: { logoUrl: string | null; primaryColor: string | null } | null }
}

export default function TenantJobDetailPage({
  params,
}: {
  params: Promise<{ subdomain: string; jobId: string }>
}) {
  const { subdomain, jobId } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) { setError("求人が見つかりませんでした"); return null }
        return r.json()
      })
      .then((data) => { if (data) setJob(data) })
      .catch(() => setError("求人の取得に失敗しました"))
      .finally(() => setIsLoading(false))
  }, [jobId])

  if (isLoading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="animate-pulse text-gray-400">読み込み中...</div>
    </div>
  )

  if (error || !job) return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4">
      <p className="text-gray-600">{error || "求人が見つかりません"}</p>
      <Link href={`/t/${subdomain}/jobs`}><Button variant="outline">求人一覧に戻る</Button></Link>
    </div>
  )

  const requiredSkills: string[] = Array.isArray(job.requirements?.required) ? job.requirements!.required! : []
  const preferredSkills: string[] = Array.isArray(job.requirements?.preferred) ? job.requirements!.preferred! : []
  const skills: string[] = Array.isArray(job.requirements?.skills) ? job.requirements!.skills! : []
  const benefitsList: string[] = Array.isArray(job.benefits)
    ? job.benefits as string[]
    : typeof job.benefits === "object" && job.benefits !== null && "items" in job.benefits
      ? (job.benefits as { items: string[] }).items ?? []
      : []

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/t/${subdomain}/jobs`} className="flex items-center gap-2">
              <Briefcase className="size-6 text-[#0D9488]" />
              <span className="text-lg font-bold text-gray-900">{job.tenant.name} 採用情報</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href={`/t/${subdomain}/jobs`} className="hover:text-[#0D9488]">求人一覧</Link>
          <ChevronRight className="size-4" />
          <span className="text-gray-900 truncate max-w-[300px]">{job.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="size-4 text-gray-400" />
                <span className="text-sm text-gray-500">{job.tenant.name}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-gray-400" />
                    <span>{job.location}{job.isRemote && " / リモート可"}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Banknote className="size-4 text-gray-400" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-gray-400" />
                  <span>{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
                </div>
                {job.isRemote && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="size-4 text-gray-400" />
                    <span>リモートワーク可</span>
                  </div>
                )}
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs bg-[#0D9488]/10 text-[#0D9488] border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">仕事内容</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</div>
            </div>

            {(requiredSkills.length > 0 || preferredSkills.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">応募資格</h2>
                {requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">必須スキル</h3>
                    <ul className="space-y-1.5">
                      {requiredSkills.map((skill, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="size-4 text-[#0D9488] mt-0.5 shrink-0" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {preferredSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">歓迎スキル</h3>
                    <ul className="space-y-1.5">
                      {preferredSkills.map((skill, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span className="text-gray-400 mt-0.5">-</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {benefitsList.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">待遇・福利厚生</h2>
                <ul className="space-y-1.5">
                  {benefitsList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="size-4 text-[#0D9488] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-24">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-1">年収</p>
                <p className="text-2xl font-bold text-[#0D9488]">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">雇用形態</span>
                  <span className="font-medium">{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
                </div>
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">勤務地</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                )}
                {job.isRemote && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">リモート</span>
                    <span className="font-medium text-[#0D9488]">可</span>
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90 text-white h-12 text-base font-bold"
                onClick={() => router.push(`/apply/${job.id}`)}
              >
                この求人に応募する
              </Button>
              <p className="text-xs text-gray-400 text-center mt-3">応募にはログインが必要です</p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-1">{job.tenant.name}</p>
          &copy; 2026 All rights reserved.
        </div>
      </footer>
    </div>
  )
}
