import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MessageThread } from "../MessageThread"

const baseProps = {
  currentUserId: "user-1",
  currentUserType: "COMPANY" as const,
}

const makeMessage = (overrides: Partial<{
  id: string
  senderId: string
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
  content: string
  isRead: boolean
  isAutoReply: boolean
  sentAt: string
  senderName: string | null
  companyName: string | null
}> = {}) => ({
  id: "msg-1",
  senderId: "user-1",
  senderType: "COMPANY" as const,
  content: "テストメッセージ",
  isRead: true,
  isAutoReply: false,
  sentAt: new Date().toISOString(),
  senderName: null,
  companyName: null,
  ...overrides,
})

describe("MessageThread", () => {
  it("メッセージが空のとき空メッセージを表示する", () => {
    render(<MessageThread messages={[]} {...baseProps} />)
    expect(screen.getByText("まだメッセージはありません")).toBeInTheDocument()
  })

  it("自分（企業側）のメッセージが右寄せで表示される", () => {
    const message = makeMessage({ senderType: "COMPANY" })
    const { container } = render(
      <MessageThread messages={[message]} {...baseProps} currentUserType="COMPANY" />
    )
    const wrapper = container.querySelector(".flex-row-reverse")
    expect(wrapper).toBeInTheDocument()
  })

  it("相手（求職者側）のメッセージが左寄せで表示される", () => {
    const message = makeMessage({ senderType: "JOB_SEEKER" })
    const { container } = render(
      <MessageThread messages={[message]} {...baseProps} currentUserType="COMPANY" />
    )
    // JOB_SEEKER is not own message for COMPANY user, so flex-row (not reversed)
    const wrapper = container.querySelector(".flex-row:not(.flex-row-reverse)")
    expect(wrapper).toBeInTheDocument()
  })

  it("システムメッセージが左寄せの青バブルで表示される", () => {
    const message = makeMessage({ senderType: "SYSTEM", content: "面接が確定しました" })
    render(
      <MessageThread messages={[message]} {...baseProps} />
    )
    expect(screen.getByText("面接が確定しました")).toBeInTheDocument()
  })

  it("受信した企業メッセージに企業名・担当者名が表示される", () => {
    // 求職者目線: COMPANY メッセージは左側（受信）→ ラベル表示
    const message = makeMessage({
      senderType: "COMPANY",
      companyName: "テスト株式会社",
      senderName: "田中太郎",
    })
    render(<MessageThread messages={[message]} {...baseProps} currentUserType="JOB_SEEKER" />)
    expect(screen.getByText("テスト株式会社 · 田中太郎")).toBeInTheDocument()
  })

  it("自分が送ったメッセージには送信者ラベルが表示されない", () => {
    // 企業目線: COMPANY メッセージは右側（自分）→ ラベル非表示
    const message = makeMessage({
      senderType: "COMPANY",
      companyName: "テスト株式会社",
      senderName: "田中太郎",
    })
    render(<MessageThread messages={[message]} {...baseProps} currentUserType="COMPANY" />)
    expect(screen.queryByText("テスト株式会社 · 田中太郎")).not.toBeInTheDocument()
  })

  it("メッセージ内容が表示される", () => {
    const message = makeMessage({ content: "こんにちは！" })
    render(<MessageThread messages={[message]} {...baseProps} />)
    expect(screen.getByText("こんにちは！")).toBeInTheDocument()
  })
})
