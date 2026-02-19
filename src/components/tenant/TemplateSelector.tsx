"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, ChevronDown } from "lucide-react"

interface MessageTemplate {
  id: string
  name: string
  rank: string | null
  subject: string | null
  body: string
}

interface TemplateSelectorProps {
  /** テンプレートが選択されたときに本文を渡すコールバック */
  onSelect: (body: string) => void
}

const RANK_LABELS: Record<string, string> = {
  S: "Sランク",
  A: "Aランク",
  B: "Bランク",
  C: "Cランク",
}

/**
 * テンプレート選択ドロップダウン（テナント管理画面・企業側のみ）
 * - テンプレート一覧を取得して表示
 * - 選択すると本文をエディタに挿入
 */
export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [previewBody, setPreviewBody] = useState<string | null>(null)

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

  // ランク別にグループ化
  const grouped = groupByRank(templates)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <FileText className="size-3.5 mr-1" />
          テンプレート
          <ChevronDown className="size-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {templates.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            テンプレートがありません
          </div>
        ) : (
          Object.entries(grouped).map(([rank, items]) => (
            <div key={rank}>
              <DropdownMenuLabel className="text-xs text-gray-500">
                {rank === "null" ? "共通テンプレート" : RANK_LABELS[rank] ?? rank}
              </DropdownMenuLabel>
              {items.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onSelect={() => onSelect(template.body)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{template.name}</span>
                    {template.subject && (
                      <span className="text-xs text-gray-500">件名: {template.subject}</span>
                    )}
                    <span className="text-xs text-gray-400 truncate max-w-[220px]">
                      {template.body.slice(0, 60)}…
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function groupByRank(
  templates: MessageTemplate[]
): Record<string, MessageTemplate[]> {
  const result: Record<string, MessageTemplate[]> = {}
  for (const t of templates) {
    const key = t.rank ?? "null"
    if (!result[key]) result[key] = []
    result[key].push(t)
  }
  return result
}
