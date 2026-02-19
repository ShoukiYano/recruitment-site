"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TenantDetail {
  id: string
  name: string
  subdomain: string
  plan: string
  isActive: boolean
  createdAt: string
  settings?: { logoUrl?: string; primaryColor?: string }
  _count?: { applications: number; jobs: number }
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [plan, setPlan] = useState("")

  useEffect(() => {
    fetch(`/api/tenants/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setTenant(data)
        setPlan(data.plan || "starter")
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [params.id])

  async function handleToggleStatus() {
    if (!tenant) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/tenants/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tenant.isActive }),
      })
      if (!res.ok) throw new Error()
      setTenant({ ...tenant, isActive: !tenant.isActive })
      toast.success(tenant.isActive ? "テナントを停止しました" : "テナントを有効化しました")
    } catch {
      toast.error("更新に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePlanChange() {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/tenants/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) throw new Error()
      setTenant(prev => prev ? { ...prev, plan } : prev)
      toast.success("プランを変更しました")
    } catch {
      toast.error("プラン変更に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>
  }

  if (!tenant) {
    return <div className="text-center py-12 text-gray-400">テナントが見つかりません</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/platform-admin/tenants">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <Badge variant={tenant.isActive ? "default" : "secondary"}>
          {tenant.isActive ? "有効" : "停止中"}
        </Badge>
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader><CardTitle>基本情報</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">テナント名</Label>
              <p className="font-medium">{tenant.name}</p>
            </div>
            <div>
              <Label className="text-gray-500">サブドメイン</Label>
              <p className="font-medium">{tenant.subdomain}.example.com</p>
            </div>
            <div>
              <Label className="text-gray-500">登録日</Label>
              <p className="font-medium">{new Date(tenant.createdAt).toLocaleDateString("ja-JP")}</p>
            </div>
            <div>
              <Label className="text-gray-500">求人数 / 応募数</Label>
              <p className="font-medium">{tenant._count?.jobs ?? 0}件 / {tenant._count?.applications ?? 0}件</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プラン変更 */}
      <Card>
        <CardHeader><CardTitle>プラン管理</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>現在のプラン</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">スターター</SelectItem>
                  <SelectItem value="business">ビジネス</SelectItem>
                  <SelectItem value="enterprise">エンタープライズ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePlanChange} disabled={isSaving} className="bg-[#1E3A5F] hover:bg-[#2d5480]">
              プラン変更
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ステータス変更 */}
      <Card>
        <CardHeader><CardTitle>ステータス管理</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {tenant.isActive
              ? "テナントを停止すると、そのテナントの全ユーザーがアクセスできなくなります。"
              : "テナントを有効化すると、再びアクセス可能になります。"}
          </p>
          <Button
            variant={tenant.isActive ? "destructive" : "default"}
            onClick={handleToggleStatus}
            disabled={isSaving}
          >
            {tenant.isActive ? "テナントを停止する" : "テナントを有効化する"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
