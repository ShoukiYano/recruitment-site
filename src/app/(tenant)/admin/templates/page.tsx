"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

interface MessageTemplate {
  id: string
  name: string
  rank: string | null
  subject: string | null
  body: string
  isActive: boolean
  createdAt: string
}

const RANK_TABS = [
  { value: "ALL", label: "全て" },
  { value: "S", label: "Sランク" },
  { value: "A", label: "Aランク" },
  { value: "B", label: "Bランク" },
  { value: "C", label: "Cランク" },
  { value: "null", label: "共通" },
]

const RANK_COLORS: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

const VARIABLES = ["{{氏名}}", "{{姓}}", "{{求人名}}", "{{会社名}}", "{{担当者名}}", "{{応募日}}", "{{日程調整URL}}"]

/**
 * 返信テンプレート設定ページ
 */
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [activeTab, setActiveTab] = useState("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    rank: "null",
    subject: "",
    body: "",
    isActive: true,
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/templates")
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("テンプレート取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // タブ別フィルタ
  const filteredTemplates =
    activeTab === "ALL"
      ? templates
      : activeTab === "null"
      ? templates.filter((t) => t.rank === null)
      : templates.filter((t) => t.rank === activeTab)

  // 新規作成ダイアログ
  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({ name: "", rank: "null", subject: "", body: "", isActive: true })
    setIsDialogOpen(true)
  }

  // 編集ダイアログ
  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      rank: template.rank ?? "null",
      subject: template.subject ?? "",
      body: template.body,
      isActive: template.isActive,
    })
    setIsDialogOpen(true)
  }

  // 保存
  const handleSave = async () => {
    if (!formData.name || !formData.body) {
      toast.error("テンプレート名と本文は必須です")
      return
    }

    const payload = {
      name: formData.name,
      rank: formData.rank === "null" ? null : formData.rank,
      subject: formData.subject || null,
      body: formData.body,
    }

    try {
      let res: Response
      if (editingTemplate) {
        res = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, isActive: formData.isActive }),
        })
      } else {
        res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        toast.success(editingTemplate ? "テンプレートを更新しました" : "テンプレートを作成しました")
        setIsDialogOpen(false)
        fetchTemplates()
      } else {
        toast.error("保存に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    }
  }

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm("このテンプレートを削除しますか？")) return
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("削除しました")
        fetchTemplates()
      }
    } catch {
      toast.error("削除に失敗しました")
    }
  }

  // 変数挿入
  const insertVariable = (variable: string) => {
    setFormData((prev) => ({ ...prev, body: prev.body + variable }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">返信テンプレート</h1>
        <Button onClick={handleCreate} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white">
          <Plus className="h-4 w-4 mr-1" />
          テンプレート作成
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
              {RANK_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0D9488] data-[state=active]:text-[#0D9488]"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {RANK_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p>テンプレートがありません</p>
                    <Button variant="link" onClick={handleCreate} className="mt-2 text-[#0D9488]">
                      作成する
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{template.name}</span>
                              {template.rank && (
                                <Badge className={RANK_COLORS[template.rank] ?? ""}>
                                  {template.rank}ランク
                                </Badge>
                              )}
                              {!template.isActive && (
                                <Badge variant="secondary" className="text-xs">無効</Badge>
                              )}
                            </div>
                            {template.subject && (
                              <p className="text-xs text-gray-500 mb-1">件名: {template.subject}</p>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-2">{template.body}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setPreviewTemplate(template); setIsPreviewOpen(true) }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 作成/編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "テンプレート編集" : "テンプレート作成"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>テンプレート名 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="例: Sランク自動返信"
                />
              </div>
              <div className="space-y-1.5">
                <Label>対象ランク</Label>
                <Select
                  value={formData.rank}
                  onValueChange={(v) => setFormData((p) => ({ ...p, rank: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">共通（全ランク）</SelectItem>
                    <SelectItem value="S">Sランク</SelectItem>
                    <SelectItem value="A">Aランク</SelectItem>
                    <SelectItem value="B">Bランク</SelectItem>
                    <SelectItem value="C">Cランク</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>件名（任意）</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                placeholder="例: 応募書類の受付確認"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>本文 *</Label>
                <div className="flex flex-wrap gap-1">
                  {VARIABLES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-gray-600"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData((p) => ({ ...p, body: e.target.value }))}
                placeholder="メッセージ本文を入力。{{氏名}}などの変数を使用できます。"
                rows={8}
                className="text-sm"
              />
            </div>

            {editingTemplate && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))}
                />
                <Label>有効</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* プレビューダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テンプレートプレビュー</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              {previewTemplate.subject && (
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">件名</p>
                  <p className="text-sm font-medium">{previewTemplate.subject}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500 mb-1">本文</p>
                <p className="text-sm whitespace-pre-wrap">{previewTemplate.body}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
