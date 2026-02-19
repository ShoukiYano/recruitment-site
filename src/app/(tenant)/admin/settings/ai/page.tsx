"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save } from "lucide-react"
import { toast } from "sonner"

interface AISettings {
  weights: {
    skillMatch: number
    experience: number
    education: number
    motivation: number
    responseQuality: number
  }
  thresholds: {
    s: number
    a: number
    b: number
  }
  requiredSkills: string[]
  autoActions: {
    S?: string
    A?: string
    B?: string
    C?: string
  }
}

const WEIGHT_LABELS = {
  skillMatch: "スキルマッチ",
  experience: "経験年数",
  education: "学歴・資格",
  motivation: "志望動機",
  responseQuality: "レスポンス品質",
}

const RANK_COLORS: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

/**
 * AI評価基準設定ページ
 */
export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>({
    weights: {
      skillMatch: 40,
      experience: 25,
      education: 15,
      motivation: 10,
      responseQuality: 10,
    },
    thresholds: { s: 85, a: 70, b: 50 },
    requiredSkills: [],
    autoActions: {},
  })
  const [newSkill, setNewSkill] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/ai/settings")
      if (res.ok) {
        const json = await res.json()
        const data = json.settings ?? json
        if (data) {
          setSettings({
            weights: data.weights ?? settings.weights,
            thresholds: data.thresholds ?? settings.thresholds,
            requiredSkills: (data.requiredSkills as string[]) ?? [],
            autoActions: (data.autoActions as Record<string, string>) ?? {},
          })
        }
      }
    } catch (error) {
      console.error("設定取得エラー:", error)
    }
  }

  // 重みの合計チェック
  const totalWeight = Object.values(settings.weights).reduce((a, b) => a + b, 0)

  const handleWeightChange = (key: keyof typeof settings.weights, value: number) => {
    setSettings((prev) => ({
      ...prev,
      weights: { ...prev.weights, [key]: value },
    }))
  }

  const handleThresholdChange = (key: keyof typeof settings.thresholds, value: number) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value },
    }))
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (!skill) return
    if (settings.requiredSkills.includes(skill)) {
      toast.error("すでに登録されています")
      return
    }
    setSettings((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, skill],
    }))
    setNewSkill("")
  }

  const removeSkill = (skill: string) => {
    setSettings((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }))
  }

  const handleSave = async () => {
    if (totalWeight !== 100) {
      toast.error("重みの合計は100%にしてください")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast.success("設定を保存しました")
      } else {
        toast.error("保存に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }

  // ランク判定シミュレーション
  const simulateRank = (score: number): string => {
    if (score >= settings.thresholds.s) return "S"
    if (score >= settings.thresholds.a) return "A"
    if (score >= settings.thresholds.b) return "B"
    return "C"
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI評価基準設定</h1>
        <Button
          onClick={handleSave}
          disabled={isSaving || totalWeight !== 100}
          className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "保存中..." : "設定を保存"}
        </Button>
      </div>

      {/* 評価重み設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">評価項目の重み付け</CardTitle>
          <p className="text-sm text-gray-500">
            合計: <span className={totalWeight !== 100 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>{totalWeight}%</span>
            {totalWeight !== 100 && " ← 合計を100%にしてください"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.entries(settings.weights) as [keyof typeof settings.weights, number][]).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{WEIGHT_LABELS[key]}</Label>
                <span className="text-sm font-medium w-12 text-right">{value}%</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([v]) => handleWeightChange(key, v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ランク閾値設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ランク閾値設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["s", "a", "b"] as const).map((rank) => {
            const rankLabel = rank.toUpperCase()
            return (
              <div key={rank} className="flex items-center gap-4">
                <Badge className={RANK_COLORS[rankLabel] ?? ""}>
                  {rankLabel}ランク
                </Badge>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.thresholds[rank]}
                    onChange={(e) => handleThresholdChange(rank, Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">点以上</span>
                </div>
              </div>
            )
          })}
          <p className="text-xs text-gray-400">
            Cランク: {settings.thresholds.b - 1}点以下（自動）
          </p>

          {/* シミュレーション */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">ランク判定シミュレーション</p>
            <div className="grid grid-cols-5 gap-2">
              {[95, 80, 65, 45, 30].map((score) => (
                <div key={score} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{score}点</p>
                  <Badge className={RANK_COLORS[simulateRank(score)] ?? ""}>
                    {simulateRank(score)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 必須スキル設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">必須スキル設定</CardTitle>
          <p className="text-sm text-gray-500">設定したスキルは評価時に重点チェックされます</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="スキルを入力（例: TypeScript）"
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button variant="outline" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {settings.requiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.requiredSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">必須スキルが設定されていません</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
