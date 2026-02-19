"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"

interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: string
  isActive: boolean
  createdAt: string
  _count?: { applications: number }
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/platform/tenants")
      .then(r => r.json())
      .then(data => { setTenants(data.tenants || []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const filtered = tenants.filter(t =>
    t.name.includes(search) || t.subdomain.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">テナント管理</h1>
        <Link href="/platform-admin/tenants/new">
          <Button className="bg-[#1E3A5F] hover:bg-[#2d5480]">
            <Plus className="h-4 w-4 mr-2" /> 新規テナント作成
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="テナント名・サブドメインで検索"
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">テナント名</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">サブドメイン</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">プラン</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">ステータス</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">登録日</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">読み込み中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">テナントが見つかりません</td></tr>
              ) : filtered.map(tenant => (
                <tr key={tenant.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{tenant.name}</td>
                  <td className="py-3 px-4 text-gray-500">{tenant.subdomain}.example.com</td>
                  <td className="py-3 px-4">{tenant.plan}</td>
                  <td className="py-3 px-4">
                    <Badge variant={tenant.isActive ? "default" : "secondary"}>
                      {tenant.isActive ? "有効" : "停止中"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/platform-admin/tenants/${tenant.id}`}>
                      <Button variant="ghost" size="sm">詳細</Button>
                    </Link>
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
