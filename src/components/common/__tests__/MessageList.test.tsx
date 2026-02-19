import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MessageList } from "../MessageList"

const makeThread = (overrides: Partial<{
  applicationId: string
  jobSeekerName: string
  jobTitle: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  senderType: "COMPANY" | "JOB_SEEKER" | "SYSTEM"
}> = {}) => ({
  applicationId: "app-1",
  jobSeekerName: "山田太郎",
  jobTitle: "エンジニア",
  lastMessage: "よろしくお願いします",
  lastMessageAt: new Date().toISOString(),
  unreadCount: 0,
  senderType: "JOB_SEEKER" as const,
  ...overrides,
})

describe("MessageList", () => {
  it("スレッドが空のとき空メッセージを表示する", () => {
    render(<MessageList threads={[]} onSelect={vi.fn()} />)
    expect(screen.getByText("メッセージはありません")).toBeInTheDocument()
  })

  it("スレッド一覧を表示する", () => {
    const threads = [
      makeThread({ applicationId: "app-1", jobSeekerName: "山田太郎" }),
      makeThread({ applicationId: "app-2", jobSeekerName: "田中花子" }),
    ]
    render(<MessageList threads={threads} onSelect={vi.fn()} />)
    expect(screen.getByText("山田太郎")).toBeInTheDocument()
    expect(screen.getByText("田中花子")).toBeInTheDocument()
  })

  it("未読バッジが正しく表示される", () => {
    const thread = makeThread({ unreadCount: 3 })
    render(<MessageList threads={[thread]} onSelect={vi.fn()} />)
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("未読が99件超の場合 99+ と表示される", () => {
    const thread = makeThread({ unreadCount: 100 })
    render(<MessageList threads={[thread]} onSelect={vi.fn()} />)
    expect(screen.getByText("99+")).toBeInTheDocument()
  })

  it("未読が0件のとき未読バッジを表示しない", () => {
    const thread = makeThread({ unreadCount: 0 })
    render(<MessageList threads={[thread]} onSelect={vi.fn()} />)
    expect(screen.queryByText("0")).not.toBeInTheDocument()
  })

  it("スレッドをクリックすると onSelect が呼ばれる", async () => {
    const onSelect = vi.fn()
    const thread = makeThread({ applicationId: "app-1" })
    render(<MessageList threads={[thread]} onSelect={onSelect} />)
    await userEvent.click(screen.getByText("山田太郎"))
    expect(onSelect).toHaveBeenCalledWith("app-1")
  })

  it("選択されたスレッドにハイライトクラスが付く", () => {
    const thread = makeThread({ applicationId: "app-1" })
    const { container } = render(
      <MessageList threads={[thread]} selectedApplicationId="app-1" onSelect={vi.fn()} />
    )
    const button = container.querySelector("button")
    expect(button?.className).toContain("border-[#0D9488]")
  })
})
