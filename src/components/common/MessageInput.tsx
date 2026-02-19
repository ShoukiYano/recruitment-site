"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  isSending?: boolean
  placeholder?: string
  extraActions?: React.ReactNode
  onContentChange?: (content: string) => void
  externalValue?: string
}

export function MessageInput({
  onSend,
  isSending = false,
  placeholder = "メッセージを入力...",
  extraActions,
  onContentChange,
  externalValue,
}: MessageInputProps) {
  const [content, setContent] = useState("")

  const displayValue = externalValue !== undefined ? externalValue : content

  const handleChange = (value: string) => {
    setContent(value)
    onContentChange?.(value)
  }

  const handleSend = async () => {
    const text = displayValue.trim()
    if (!text || isSending) return
    await onSend(text)
    setContent("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = !displayValue.trim()

  return (
    <div className="border-t border-gray-200 bg-white px-4 pt-3 pb-4">
      {extraActions && (
        <div className="mb-2 flex gap-2 flex-wrap">{extraActions}</div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className="resize-none text-sm pr-2 leading-relaxed"
            disabled={isSending}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={isEmpty || isSending}
          size="icon"
          className={`h-[76px] w-11 shrink-0 rounded-xl transition-all ${
            isEmpty || isSending
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
          }`}
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-1.5">
        Ctrl + Enter で送信
      </p>
    </div>
  )
}
