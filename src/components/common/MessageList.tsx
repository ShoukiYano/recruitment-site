"use client"

import { MessageCircle, Bot } from "lucide-react"

interface MessageThread {
  applicationId: string
  jobSeekerName: string
  jobTitle: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
}

interface MessageListProps {
  threads: MessageThread[]
  selectedApplicationId?: string
  onSelect: (applicationId: string) => void
}

export function MessageList({ threads, selectedApplicationId, onSelect }: MessageListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <MessageCircle className="size-6" />
        </div>
        <p className="text-sm">メッセージはありません</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {threads.map((thread) => {
        const isSelected = thread.applicationId === selectedApplicationId
        const initial = thread.jobSeekerName.charAt(0)

        return (
          <li key={thread.applicationId}>
            <button
              onClick={() => onSelect(thread.applicationId)}
              className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors relative ${
                isSelected ? "bg-[#0D9488]/5 border-l-[3px] border-[#0D9488]" : "border-l-[3px] border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* アバター */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected
                      ? "bg-[#0D9488] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {initial}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 名前 + 日時 */}
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-sm font-semibold truncate ${isSelected ? "text-[#0D9488]" : "text-gray-900"}`}>
                      {thread.jobSeekerName}
                    </span>
                    <time className="text-xs text-gray-400 shrink-0">
                      {formatDate(thread.lastMessageAt)}
                    </time>
                  </div>

                  {/* 求人名 */}
                  <p className="text-xs text-gray-400 truncate mb-1">{thread.jobTitle}</p>

                  {/* 最終メッセージ + 未読バッジ */}
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate flex items-center gap-1 ${thread.unreadCount > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                      {thread.senderType === "SYSTEM" && (
                        <Bot className="size-3 shrink-0 text-blue-400" />
                      )}
                      {truncate(thread.lastMessage, 45)}
                    </p>
                    {thread.unreadCount > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 bg-[#0D9488] text-white text-xs rounded-full flex items-center justify-center px-1.5 font-medium">
                        {thread.unreadCount > 99 ? "99+" : thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "…"
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return "今"
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
  if (diffDays < 7) return date.toLocaleDateString("ja-JP", { weekday: "short" })
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
}
