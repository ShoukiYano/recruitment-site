"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, Clock, CalendarCheck, UserCheck } from "lucide-react"

const rankColors: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

type RecentApplicant = {
  id: string
  name: string
  job: string
  rank: string | null
  score: number | null
  date: string
}

type DashboardData = {
  stats: {
    monthlyCount: number
    newCount: number
    interviewCount: number
    offeredCount: number
  }
  trend: { month: string; count: number }[]
  rankDistribution: { name: string; value: number; color: string }[]
  recentApplicants: RecentApplicant[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="text-gray-500 p-6">読み込み中...</div>
  if (!data) return <div className="text-gray-500 p-6">データの取得に失敗しました</div>

  const statCards = [
    { label: "今月の応募数", value: data.stats.monthlyCount, icon: Users },
    { label: "未対応", value: data.stats.newCount, icon: Clock },
    { label: "面接予定", value: data.stats.interviewCount, icon: CalendarCheck },
    { label: "採用数", value: data.stats.offeredCount, icon: UserCheck },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-[#0D9488]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 応募数推移 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">応募数推移（過去6ヶ月）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0D9488"
                  strokeWidth={2}
                  dot={{ fill: "#0D9488" }}
                  name="応募数"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AIランク分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AIランク分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.rankDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.rankDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 最新応募者テーブル */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最新の応募者</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentApplicants.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">まだ応募者がいません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">応募者名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">応募求人</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">AIランク</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">スコア</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">応募日</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{applicant.name}</td>
                      <td className="py-3 px-4 text-gray-600">{applicant.job}</td>
                      <td className="py-3 px-4">
                        {applicant.rank ? (
                          <Badge className={rankColors[applicant.rank]}>{applicant.rank}</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">未評価</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {applicant.score !== null ? `${applicant.score}点` : "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{applicant.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
