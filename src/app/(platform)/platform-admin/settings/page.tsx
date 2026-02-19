"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">システム設定</h1>
      <Card>
        <CardHeader><CardTitle>基本設定</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>プラットフォーム名</Label>
            <Input defaultValue="AI採用プラットフォーム" />
          </div>
          <div>
            <Label>ベースドメイン</Label>
            <Input defaultValue="example.com" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>メンテナンスモード</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Switch id="maintenance" />
          <Label htmlFor="maintenance">メンテナンスモードを有効にする</Label>
        </CardContent>
      </Card>
      <Button className="bg-[#1E3A5F] hover:bg-[#2d5480]">設定を保存</Button>
    </div>
  )
}
