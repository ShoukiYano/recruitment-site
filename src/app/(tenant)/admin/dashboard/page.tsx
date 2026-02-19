"use client"

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

// 統計データ（モック）
const stats = [
  { label: "今月の応募数", value: 128, icon: Users, change: "+12%" },
  { label: "未対応", value: 23, icon: Clock, change: "-5%" },
  { label: "面接予定", value: 15, icon: CalendarCheck, change: "+3%" },
  { label: "採用数", value: 8, icon: UserCheck, change: "+2%" },
]

// 応募数推移データ（モック）
const applicationTrend = [
  { month: "8月", count: 45 },
  { month: "9月", count: 62 },
  { month: "10月", count: 78 },
  { month: "11月", count: 95 },
  { month: "12月", count: 110 },
  { month: "1月", count: 128 },
]

// AIランク分布データ（モック）
const rankDistribution = [
  { name: "Sランク", value: 15, color: "#F59E0B" },
  { name: "Aランク", value: 35, color: "#0D9488" },
  { name: "Bランク", value: 50, color: "#6B7280" },
  { name: "Cランク", value: 28, color: "#E5E7EB" },
]

// 最新応募者データ（モック）
const recentApplicants = [
  { id: "1", name: "田中 太郎", job: "フロントエンドエンジニア", rank: "S" as const, score: 92, date: "2026-02-18" },
  { id: "2", name: "佐藤 花子", job: "バックエンドエンジニア", rank: "A" as const, score: 78, date: "2026-02-17" },
  { id: "3", name: "鈴木 一郎", job: "プロダクトマネージャー", rank: "A" as const, score: 75, date: "2026-02-17" },
  { id: "4", name: "高橋 美咲", job: "デザイナー", rank: "B" as const, score: 63, date: "2026-02-16" },
  { id: "5", name: "渡辺 健太", job: "フロントエンドエンジニア", rank: "C" as const, score: 42, date: "2026-02-16" },
]

// ランク別バッジ色の定義
const rankColors: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#0D9488] mt-1">{stat.change}</p>
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
            <CardTitle className="text-lg">応募数推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={applicationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
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
                  data={rankDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {rankDistribution.map((entry, index) => (
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
                {recentApplicants.map((applicant) => (
                  <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{applicant.name}</td>
                    <td className="py-3 px-4 text-gray-600">{applicant.job}</td>
                    <td className="py-3 px-4">
                      <Badge className={rankColors[applicant.rank]}>
                        {applicant.rank}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{applicant.score}点</td>
                    <td className="py-3 px-4 text-gray-500">{applicant.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
