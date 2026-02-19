"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Save, KeyRound } from "lucide-react"
import { toast } from "sonner"

const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: "システム管理者",
  TENANT_ADMIN: "企業管理者",
  TENANT_USER: "担当者",
}

const ROLE_COLORS: Record<string, string> = {
  SYSTEM_ADMIN: "bg-red-100 text-red-700",
  TENANT_ADMIN: "bg-blue-100 text-blue-700",
  TENANT_USER: "bg-gray-100 text-gray-700",
}

/**
 * ユーザープロフィール・アカウント設定ページ
 */
export default function UsersSettingsPage() {
  const { data: session, update } = useSession()
  const user = session?.user

  const [name, setName] = useState(user?.name ?? "")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("名前を入力してください")
      return
    }
    setIsSavingProfile(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        await update({ name: name.trim() })
        toast.success("プロフィールを更新しました")
      } else {
        toast.error("更新に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("すべての項目を入力してください")
      return
    }
    if (newPassword.length < 8) {
      toast.error("新しいパスワードは8文字以上にしてください")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("新しいパスワードが一致しません")
      return
    }
    setIsSavingPassword(true)
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast.success("パスワードを変更しました")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error ?? "パスワードの変更に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        読み込み中...
      </div>
    )
  }

  const roleLabel = ROLE_LABELS[user.role ?? ""] ?? user.role ?? ""
  const roleColor = ROLE_COLORS[user.role ?? ""] ?? "bg-gray-100 text-gray-700"
  const initial = (user.name ?? "U").charAt(0)

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>

      {/* アカウント情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">アカウント情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* アバター + ロール */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#0D9488] text-white text-xl">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge className={`mt-1 text-xs ${roleColor}`}>{roleLabel}</Badge>
            </div>
          </div>

          {/* 名前編集 */}
          <div className="space-y-2">
            <Label htmlFor="name">表示名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="表示名を入力"
            />
          </div>

          {/* メールアドレス（変更不可） */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              value={user.email ?? ""}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400">メールアドレスの変更は管理者にお問い合わせください</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile || name.trim() === (user.name ?? "")}
            className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSavingProfile ? "保存中..." : "プロフィールを保存"}
          </Button>
        </CardContent>
      </Card>

      {/* パスワード変更 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            パスワード変更
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">現在のパスワード</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="現在のパスワード"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8文字以上"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            variant="outline"
          >
            {isSavingPassword ? "変更中..." : "パスワードを変更"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
