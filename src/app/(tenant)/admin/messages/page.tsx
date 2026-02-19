"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageList } from "@/components/common/MessageList"
import { MessageThread } from "@/components/common/MessageThread"
import { MessageInput } from "@/components/common/MessageInput"
import { TemplateSelector } from "@/components/tenant/TemplateSelector"
import { useSession } from "next-auth/react"
import { MessageCircle } from "lucide-react"

interface ThreadSummary {
  applicationId: string
  jobSeekerName: string
  jobTitle: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
}

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

/**
 * テナント管理 - メッセージ管理ページ
 * 左ペインにスレッド一覧、右ペインにチャット表示
 */
export default function AdminMessagesPage() {
  const { data: session } = useSession()
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [templateValue, setTemplateValue] = useState("")

  // スレッド一覧取得
  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/messages")
      if (res.ok) {
        const data = await res.json()
        setThreads(data)
      }
    } catch (error) {
      console.error("スレッド取得エラー:", error)
    }
  }, [])

  // 選択中スレッドのメッセージ取得
  const fetchMessages = useCallback(async (applicationId: string) => {
    try {
      const res = await fetch(`/api/messages/${applicationId}`)
      if (res.ok) {
        const data: Message[] = await res.json()
        setMessages(data)

        // 未読の求職者メッセージを既読に
        const unreadIds = data
          .filter((m) => !m.isRead && m.senderType === "JOB_SEEKER")
          .map((m) => m.id)
        if (unreadIds.length > 0) {
          await fetch("/api/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageIds: unreadIds }),
          })
          fetchThreads()
        }
      }
    } catch (error) {
      console.error("メッセージ取得エラー:", error)
    }
  }, [fetchThreads])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  // スレッド選択時
  const handleSelectThread = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    fetchMessages(applicationId)
  }

  // 5秒ポーリング（選択中スレッドのみ）
  useEffect(() => {
    if (!selectedApplicationId) return
    const timer = setInterval(() => {
      fetchMessages(selectedApplicationId)
    }, 5000)
    return () => clearInterval(timer)
  }, [selectedApplicationId, fetchMessages])

  // メッセージ送信
  const handleSend = async (content: string) => {
    if (!selectedApplicationId) return
    setIsSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedApplicationId, content }),
      })
      if (res.ok) {
        setTemplateValue("") // テンプレート値をリセット
        await fetchMessages(selectedApplicationId)
        await fetchThreads()
      }
    } catch (error) {
      console.error("送信エラー:", error)
    } finally {
      setIsSending(false)
    }
  }

  // テンプレート挿入
  const handleTemplateSelect = (body: string) => {
    setTemplateValue(body)
  }

  const selectedThread = threads.find(
    (t) => t.applicationId === selectedApplicationId
  )

  return (
    <div className="h-[calc(100vh-120px)] flex gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 左ペイン: スレッド一覧 */}
      <div className="w-72 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">メッセージ</h2>
          <p className="text-xs text-gray-500 mt-0.5">{threads.length}件のスレッド</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageList
            threads={threads}
            selectedApplicationId={selectedApplicationId}
            onSelect={handleSelectThread}
          />
        </div>
      </div>

      {/* 右ペイン: チャット */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* チャットヘッダー */}
            <div className="p-4 border-b border-gray-200">
              <p className="font-medium text-gray-900">{selectedThread.jobSeekerName}</p>
              <p className="text-xs text-gray-500">{selectedThread.jobTitle}</p>
            </div>

            {/* メッセージ表示 */}
            <div className="flex-1 overflow-y-auto">
              <MessageThread
                messages={messages}
                currentUserId={session?.user?.id ?? ""}
                currentUserType="COMPANY"
              />
            </div>

            {/* 入力エリア */}
            <MessageInput
              onSend={handleSend}
              isSending={isSending}
              placeholder="メッセージを入力... (Ctrl+Enter で送信)"
              externalValue={templateValue}
              onContentChange={(v) => setTemplateValue(v)}
              extraActions={
                <TemplateSelector onSelect={handleTemplateSelect} />
              }
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageCircle className="size-12" />
            <p className="text-sm">メッセージスレッドを選択してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
