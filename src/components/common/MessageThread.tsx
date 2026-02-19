"use client"

import { useEffect, useRef } from "react"
import { Building2, User } from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
  content: string
  isRead: boolean
  isAutoReply: boolean
  sentAt: string
  senderName?: string | null
  companyName?: string | null
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  currentUserType: "COMPANY" | "JOB_SEEKER"
}

export function MessageThread({ messages, currentUserId, currentUserType }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 py-16">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Building2 className="size-6 text-gray-400" />
        </div>
        <p className="text-sm">まだメッセージはありません</p>
      </div>
    )
  }

  // 日付区切りを挿入するためにメッセージをグループ化
  const groupedMessages = groupByDate(messages)

  return (
    <div className="flex flex-col gap-1 p-4 pb-6">
      {groupedMessages.map((group) => (
        <div key={group.dateLabel}>
          {/* 日付区切り */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 shrink-0 px-2">{group.dateLabel}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-3">
            {group.messages.map((message) => {
              const isOwn =
                currentUserType === "COMPANY"
                  ? message.senderType === "COMPANY"
                  : message.senderType === "JOB_SEEKER"

              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* アバター */}
                  <div className="shrink-0 mt-0.5">
                    {message.senderType === "SYSTEM" || message.senderType === "COMPANY" ? (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Building2 className="size-4 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                        <User className="size-4 text-[#0D9488]" />
                      </div>
                    )}
                  </div>

                  {/* バブル本体 */}
                  <div className={`flex flex-col gap-1 max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                    {/* 送信者ラベル（受信した企業・システムメッセージのみ） */}
                    {!isOwn && (message.senderType === "COMPANY" || message.senderType === "SYSTEM") && (
                      <div className="flex items-center gap-1 px-1">
                        <span className="text-xs text-gray-500">
                          {[message.companyName, message.senderName].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    )}

                    {/* メッセージバブル */}
                    <div
                      className={`
                        relative px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words
                        ${isOwn
                          ? "bg-[#0D9488] text-white rounded-2xl rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                        }
                      `}
                    >
                      {message.content}
                    </div>

                    {/* タイムスタンプ */}
                    <time className="text-xs text-gray-400 px-1">
                      {formatTime(message.sentAt)}
                    </time>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}

// ---- ユーティリティ ----

interface DateGroup {
  dateLabel: string
  messages: Message[]
}

function groupByDate(messages: Message[]): DateGroup[] {
  const groups: DateGroup[] = []
  let currentLabel = ""

  for (const msg of messages) {
    const label = formatDateLabel(msg.sentAt)
    if (label !== currentLabel) {
      currentLabel = label
      groups.push({ dateLabel: label, messages: [] })
    }
    groups[groups.length - 1].messages.push(msg)
  }

  return groups
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (target.getTime() === today.getTime()) return "今日"
  if (target.getTime() === yesterday.getTime()) return "昨日"
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
}
