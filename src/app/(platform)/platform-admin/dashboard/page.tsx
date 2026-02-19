"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, FileText, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

const mockStats = [
  { label: "総テナント数", value: "12社", icon: Building2, color: "text-blue-600" },
  { label: "総応募数（今月）", value: "1,284件", icon: Users, color: "text-teal-600" },
  { label: "未入金請求書", value: "3件", icon: FileText, color: "text-amber-600" },
  { label: "MRR", value: "\u00A5780,000", icon: TrendingUp, color: "text-green-600" },
]

export default function PlatformDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">運営ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* テナント利用状況テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>テナント別利用状況</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-gray-500 font-medium">テナント名</th>
                <th className="text-left py-2 px-4 text-gray-500 font-medium">プラン</th>
                <th className="text-left py-2 px-4 text-gray-500 font-medium">今月の応募数</th>
                <th className="text-left py-2 px-4 text-gray-500 font-medium">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "ABC株式会社", plan: "ビジネス", applications: 245, active: true },
                { name: "XYZ株式会社", plan: "スターター", applications: 32, active: true },
                { name: "テスト株式会社", plan: "エンタープライズ", applications: 503, active: true },
              ].map((tenant) => (
                <tr key={tenant.name} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{tenant.name}</td>
                  <td className="py-3 px-4 text-gray-600">{tenant.plan}</td>
                  <td className="py-3 px-4">{tenant.applications}件</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tenant.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {tenant.active ? "有効" : "停止"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
