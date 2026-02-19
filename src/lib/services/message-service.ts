import { prisma } from "@/lib/prisma"
import type { Message, MessageSenderType } from "@prisma/client"

/**
 * メッセージスレッド（一覧表示用）
 */
export interface MessageThread {
  applicationId: string
  jobSeekerName: string
  jobTitle: string
  lastMessage: string
  lastMessageAt: Date
  unreadCount: number
  senderType: MessageSenderType
}

/**
 * メッセージ送信
 */
export async function sendMessage(params: {
  tenantId: string
  applicationId: string
  senderId: string
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
  content: string
  isAutoReply?: boolean
}): Promise<Message> {
  return prisma.message.create({
    data: {
      tenantId: params.tenantId,
      applicationId: params.applicationId,
      senderId: params.senderId,
      senderType: params.senderType,
      content: params.content,
      isAutoReply: params.isAutoReply ?? false,
    },
  })
}

/**
 * メッセージ一覧取得（企業側）- 応募ごとにスレッドをまとめる
 */
export async function getMessagesByTenant(
  tenantId: string,
  filters?: { keyword?: string }
): Promise<MessageThread[]> {
  // 各応募の最新メッセージを取得
  const applications = await prisma.application.findMany({
    where: {
      tenantId,
      messages: { some: {} }, // メッセージが1件以上ある応募のみ
    },
    include: {
      job: { select: { title: true } },
      jobSeeker: { select: { name: true } },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false, senderType: "JOB_SEEKER" },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const threads: MessageThread[] = applications
    .filter((app) => app.messages.length > 0)
    .filter((app) => {
      if (!filters?.keyword) return true
      const kw = filters.keyword.toLowerCase()
      return (
        app.jobSeeker.name.toLowerCase().includes(kw) ||
        app.job.title.toLowerCase().includes(kw)
      )
    })
    .map((app) => ({
      applicationId: app.id,
      jobSeekerName: app.jobSeeker.name,
      jobTitle: app.job.title,
      lastMessage: app.messages[0].content,
      lastMessageAt: app.messages[0].sentAt,
      unreadCount: app._count.messages,
      senderType: app.messages[0].senderType,
    }))

  return threads
}

/**
 * メッセージ一覧取得（求職者側）
 */
export async function getMessagesByJobSeeker(
  jobSeekerId: string
): Promise<MessageThread[]> {
  const applications = await prisma.application.findMany({
    where: {
      jobSeekerId,
      messages: { some: {} },
    },
    include: {
      job: { select: { title: true } },
      jobSeeker: { select: { name: true } },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false, senderType: { in: ["COMPANY", "SYSTEM"] } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return applications
    .filter((app) => app.messages.length > 0)
    .map((app) => ({
      applicationId: app.id,
      jobSeekerName: app.jobSeeker.name,
      jobTitle: app.job.title,
      lastMessage: app.messages[0].content,
      lastMessageAt: app.messages[0].sentAt,
      unreadCount: app._count.messages,
      senderType: app.messages[0].senderType,
    }))
}

export interface EnrichedMessage extends Message {
  senderName: string | null
  companyName: string | null
}

/**
 * スレッド内のメッセージ一覧取得（送信者名・企業名付き）
 */
export async function getMessageThread(applicationId: string): Promise<EnrichedMessage[]> {
  const messages = await prisma.message.findMany({
    where: { applicationId },
    orderBy: { sentAt: "asc" },
  })

  if (messages.length === 0) return []

  // COMPANY メッセージ送信者(User)の名前を取得
  const companySenderIds = [...new Set(
    messages.filter((m) => m.senderType === "COMPANY").map((m) => m.senderId)
  )]
  const users = companySenderIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: companySenderIds } },
        select: { id: true, name: true },
      })
    : []
  const userMap = new Map(users.map((u) => [u.id, u.name]))

  // テナント名取得
  const tenantId = messages[0].tenantId
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  })

  return messages.map((m) => ({
    ...m,
    senderName:
      m.senderType === "COMPANY"
        ? (userMap.get(m.senderId) ?? "担当者")
        : m.senderType === "SYSTEM"
        ? "採用担当"
        : null,
    companyName:
      m.senderType === "COMPANY" || m.senderType === "SYSTEM"
        ? (tenant?.name ?? null)
        : null,
  }))
}

/**
 * 既読更新
 */
export async function markAsRead(messageIds: string[]): Promise<void> {
  await prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: { isRead: true },
  })
}

/**
 * 未読数取得
 * userType: "COMPANY" → 求職者からの未読数
 * userType: "JOB_SEEKER" → 企業からの未読数
 */
export async function getUnreadCount(
  userId: string,
  userType: "COMPANY" | "JOB_SEEKER"
): Promise<number> {
  if (userType === "COMPANY") {
    // 企業側: 求職者からの未読メッセージ数
    const count = await prisma.message.count({
      where: {
        isRead: false,
        senderType: "JOB_SEEKER",
        application: { jobSeekerId: userId },
      },
    })
    return count
  } else {
    // 求職者側: 企業・システムからの未読メッセージ数
    const count = await prisma.message.count({
      where: {
        isRead: false,
        senderType: { in: ["COMPANY", "SYSTEM"] },
        application: { jobSeekerId: userId },
      },
    })
    return count
  }
}
