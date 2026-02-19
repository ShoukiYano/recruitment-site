"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Check } from "lucide-react"

const plans = [
  {
    name: "スターター",
    price: 29800,
    description: "小規模企業向け",
    limits: { jobs: 5, applications: 100, users: 3 },
    features: ["求人掲載（5件まで）", "応募管理", "メッセージ機能", "基本レポート"],
  },
  {
    name: "ビジネス",
    price: 98000,
    description: "中規模企業向け",
    popular: true,
    limits: { jobs: 20, applications: 500, users: 10 },
    features: ["求人掲載（20件まで）", "応募管理", "メッセージ機能", "AI評価機能", "詳細レポート", "メールテンプレート"],
  },
  {
    name: "エンタープライズ",
    price: 198000,
    description: "大規模企業向け",
    limits: { jobs: -1, applications: -1, users: -1 },
    features: ["求人掲載（無制限）", "応募管理", "メッセージ機能", "AI評価機能", "詳細レポート", "メールテンプレート", "カスタムブランディング", "専用サポート", "API連携"],
  },
]

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">プラン管理</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.popular ? "ring-2 ring-[#1E3A5F]" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                {plan.popular && <Badge className="bg-[#1E3A5F]">人気</Badge>}
              </div>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">{plan.price.toLocaleString("ja-JP")}</span>
                <span className="text-gray-500 text-sm">円/月</span>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>求人数上限: {plan.limits.jobs === -1 ? "無制限" : `${plan.limits.jobs}件`}</p>
                <p>月間応募上限: {plan.limits.applications === -1 ? "無制限" : `${plan.limits.applications}件`}</p>
                <p>ユーザー数上限: {plan.limits.users === -1 ? "無制限" : `${plan.limits.users}名`}</p>
              </div>

              <div className="border-t pt-4 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
