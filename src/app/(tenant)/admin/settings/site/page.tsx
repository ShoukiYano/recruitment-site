"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, ExternalLink } from "lucide-react"
import { getTenantJobsUrl, getTenantLoginUrl } from "@/lib/url"

function CopyableUrl({ label, url, description }: { label: string; url: string; description: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック
      const el = document.createElement("textarea")
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
      <div className="flex gap-2">
        <Input value={url} readOnly className="font-mono text-sm bg-gray-50" />
        <Button variant="outline" size="icon" onClick={handleCopy} title="コピー">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" asChild title="開く">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}

export default function SiteSettingsPage() {
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tenant-settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.subdomain) setSubdomain(json.data.subdomain)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="text-gray-500 p-6">読み込み中...</div>

  if (!subdomain) return (
    <div className="text-red-500 p-6">テナント情報が取得できませんでした</div>
  )

  const jobsUrl = getTenantJobsUrl(subdomain)
  const loginUrl = getTenantLoginUrl(subdomain)

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">サイトURL</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">採用サイトURL</CardTitle>
          <p className="text-sm text-gray-500">
            求職者に共有するURLです。このページから貴社の公開求人一覧が閲覧できます。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <CopyableUrl
            label="採用サイト（求職者向け）"
            url={jobsUrl}
            description="求職者に共有する採用ページのURLです"
          />
          <CopyableUrl
            label="管理者ログインURL"
            url={loginUrl}
            description="採用担当者がログインするURLです"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">サブドメイン</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <p className="text-sm text-gray-500">
              現在割り当てられているサブドメイン識別子です。変更する場合はシステム管理者にお問い合わせください。
            </p>
            <Input value={subdomain} readOnly className="font-mono bg-gray-50 max-w-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
