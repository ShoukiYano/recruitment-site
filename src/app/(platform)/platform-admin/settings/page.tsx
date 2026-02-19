"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getBaseUrl, getPublicJobsUrl, getAdminLoginUrl } from "@/lib/url"

export default function SystemSettingsPage() {
  const baseUrl = getBaseUrl()
  const jobsUrl = getPublicJobsUrl()
  const adminLoginUrl = getAdminLoginUrl()

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">システム設定</h1>

      <Card>
        <CardHeader><CardTitle>プラットフォームURL</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ベースURL</Label>
            <Input value={baseUrl} readOnly className="font-mono bg-gray-50 mt-1" />
          </div>
          <div>
            <Label>公開求人一覧URL</Label>
            <Input value={jobsUrl} readOnly className="font-mono bg-gray-50 mt-1" />
          </div>
          <div>
            <Label>システム管理者ログインURL</Label>
            <Input value={adminLoginUrl} readOnly className="font-mono bg-gray-50 mt-1" />
          </div>
          <div>
            <Label>テナント管理者ログインURL形式</Label>
            <Input value={`${baseUrl}/t/[サブドメイン]/login`} readOnly className="font-mono bg-gray-50 mt-1" />
          </div>
          <div>
            <Label>テナント採用ページURL形式</Label>
            <Input value={`${baseUrl}/t/[サブドメイン]/jobs`} readOnly className="font-mono bg-gray-50 mt-1" />
          </div>
          <p className="text-xs text-gray-400">
            URLを変更するには環境変数 NEXT_PUBLIC_BASE_URL を更新してください
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
