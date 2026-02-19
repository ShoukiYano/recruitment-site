"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Weights {
  skillMatch: number
  experience: number
  education: number
  motivation: number
  responseQuality: number
}

interface AISettings {
  weights: Weights
  thresholds: { s: number; a: number; b: number }
  requiredSkills: string[]
  autoActions: { S?: string; A?: string; B?: string; C?: string }
}

const WEIGHT_KEYS = ["skillMatch", "experience", "education", "motivation", "responseQuality"] as const

const WEIGHT_LABELS: Record<keyof Weights, string> = {
  skillMatch: "スキルマッチ",
  experience: "経験年数",
  education: "学歴・資格",
  motivation: "志望動機",
  responseQuality: "レスポンス品質",
}

const WEIGHT_COLORS = ["bg-[#0D9488]", "bg-[#3B82F6]", "bg-[#F59E0B]", "bg-[#8B5CF6]", "bg-[#EC4899]"]
const WEIGHT_TEXT_COLORS = ["text-[#0D9488]", "text-[#3B82F6]", "text-[#F59E0B]", "text-[#8B5CF6]", "text-[#EC4899]"]

const RANK_COLORS: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

const DEFAULT_SETTINGS: AISettings = {
  weights: { skillMatch: 40, experience: 25, education: 15, motivation: 10, responseQuality: 10 },
  thresholds: { s: 85, a: 70, b: 50 },
  requiredSkills: [],
  autoActions: {},
}

/**
 * 指定した項目の重みを変更し、他の項目を比例調整して合計を常に 100% に保つ
 */
function applyWeightChange(prev: Weights, changedKey: keyof Weights, newVal: number): Weights {
  const clamped = Math.max(0, Math.min(100, newVal))
  const remaining = 100 - clamped
  const otherKeys = WEIGHT_KEYS.filter((k) => k !== changedKey)
  const otherTotal = otherKeys.reduce((sum, k) => sum + prev[k], 0)

  const result = { ...prev, [changedKey]: clamped }

  if (otherTotal === 0) {
    // 他が全て 0 の場合：均等配分
    const base = Math.floor(remaining / otherKeys.length)
    const extra = remaining - base * otherKeys.length
    otherKeys.forEach((k, i) => {
      result[k] = base + (i === 0 ? extra : 0)
    })
  } else {
    // 現在の比率に応じて残りを配分し、端数を最後の項目で吸収
    let distributed = 0
    otherKeys.forEach((k, i) => {
      if (i === otherKeys.length - 1) {
        result[k] = Math.max(0, remaining - distributed)
      } else {
        const share = Math.round((prev[k] / otherTotal) * remaining)
        result[k] = Math.max(0, share)
        distributed += result[k]
      }
    })
  }

  return result
}

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS)
  const [newSkill, setNewSkill] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/ai/settings")
      const json = await res.json()
      const data = json.settings ?? json.data ?? json
      if (data?.weights) {
        setSettings({
          weights: data.weights,
          thresholds: data.thresholds ?? DEFAULT_SETTINGS.thresholds,
          requiredSkills: data.requiredSkills ?? [],
          autoActions: data.autoActions ?? {},
        })
      }
    } catch (error) {
      console.error("設定取得エラー:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalWeight = Object.values(settings.weights).reduce((a, b) => a + b, 0)

  const handleWeightChange = (key: keyof Weights, value: number) => {
    setSettings((prev) => ({
      ...prev,
      weights: applyWeightChange(prev.weights, key, value),
    }))
  }

  const handleEqualDistribution = () => {
    setSettings((prev) => ({
      ...prev,
      weights: { skillMatch: 20, experience: 20, education: 20, motivation: 20, responseQuality: 20 },
    }))
    toast.success("全項目を均等配分（各20%）にリセットしました")
  }

  const handleThresholdChange = (key: keyof AISettings["thresholds"], value: number) => {
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
    setSettings((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, skill] }))
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
      toast.error("重みの合計が100%になっていません")
      return
    }
    if (settings.thresholds.s <= settings.thresholds.a) {
      toast.error("Sランク閾値はAランクより大きい値にしてください")
      return
    }
    if (settings.thresholds.a <= settings.thresholds.b) {
      toast.error("Aランク閾値はBランクより大きい値にしてください")
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
        const err = await res.json()
        toast.error(err.error ?? "保存に失敗しました")
      }
    } catch {
      toast.error("エラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }

  const simulateRank = (score: number) => {
    if (score >= settings.thresholds.s) return "S"
    if (score >= settings.thresholds.a) return "A"
    if (score >= settings.thresholds.b) return "B"
    return "C"
  }

  if (isLoading) return <div className="text-gray-500 p-6">読み込み中...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI評価基準設定</h1>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white">
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "保存中..." : "設定を保存"}
        </Button>
      </div>

      {/* 評価重み設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">評価項目の重み付け</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                スライダーを動かすと他の項目が自動調整され、合計は常に
                <span className="text-green-600 font-bold mx-1">100%</span>
                になります
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleEqualDistribution} className="shrink-0">
              <RefreshCw className="h-3 w-3 mr-1" />
              均等配分
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 積み上げ比率バー */}
          <div>
            <div className="flex gap-0.5 h-5 rounded overflow-hidden">
              {WEIGHT_KEYS.map((key, i) => (
                <div
                  key={key}
                  className={`${WEIGHT_COLORS[i]} transition-all duration-200 flex items-center justify-center`}
                  style={{ width: `${settings.weights[key]}%` }}
                  title={`${WEIGHT_LABELS[key]}: ${settings.weights[key]}%`}
                >
                  {settings.weights[key] >= 12 && (
                    <span className="text-white text-[10px] font-bold leading-none">
                      {settings.weights[key]}%
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {WEIGHT_KEYS.map((key, i) => (
                <span key={key} className={`text-xs font-medium ${WEIGHT_TEXT_COLORS[i]}`}>
                  ■ {WEIGHT_LABELS[key]}
                </span>
              ))}
            </div>
          </div>

          {/* スライダー */}
          <div className="space-y-4 pt-1">
            {WEIGHT_KEYS.map((key, i) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className={`text-sm font-medium ${WEIGHT_TEXT_COLORS[i]}`}>
                    {WEIGHT_LABELS[key]}
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.weights[key]}
                      onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                      className="w-16 h-7 text-sm text-right"
                    />
                    <span className="text-sm text-gray-400 w-4">%</span>
                  </div>
                </div>
                <Slider
                  value={[settings.weights[key]]}
                  onValueChange={([v]) => handleWeightChange(key, v)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t flex justify-between text-sm">
            <span className="text-gray-500">合計</span>
            <span className="font-bold text-green-600">{totalWeight}%</span>
          </div>
        </CardContent>
      </Card>

      {/* ランク閾値設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ランク閾値設定</CardTitle>
          <p className="text-sm text-gray-500">S &gt; A &gt; B の順に大きい値を設定してください</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["s", "a", "b"] as const).map((rank) => {
            const label = rank.toUpperCase()
            const isInvalid =
              (rank === "s" && settings.thresholds.s <= settings.thresholds.a) ||
              (rank === "a" && settings.thresholds.a <= settings.thresholds.b)
            return (
              <div key={rank} className="flex items-center gap-4">
                <Badge className={RANK_COLORS[label] ?? ""}>{label}ランク</Badge>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.thresholds[rank]}
                    onChange={(e) => handleThresholdChange(rank, Number(e.target.value))}
                    className={`w-20 ${isInvalid ? "border-red-400" : ""}`}
                  />
                  <span className="text-sm text-gray-500">点以上</span>
                  {isInvalid && <span className="text-xs text-red-500">順序が正しくありません</span>}
                </div>
              </div>
            )
          })}
          <p className="text-xs text-gray-400">Cランク: {settings.thresholds.b - 1}点以下（自動）</p>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">ランク判定シミュレーション</p>
            <div className="grid grid-cols-5 gap-2">
              {[95, 80, 65, 45, 30].map((score) => (
                <div key={score} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{score}点</p>
                  <Badge className={RANK_COLORS[simulateRank(score)] ?? ""}>{simulateRank(score)}</Badge>
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
