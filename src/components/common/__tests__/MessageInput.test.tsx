import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MessageInput } from "../MessageInput"

describe("MessageInput", () => {
  it("テキストエリアとボタンが表示される", () => {
    render(<MessageInput onSend={vi.fn()} />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("空のときはボタンが無効化されている", () => {
    render(<MessageInput onSend={vi.fn()} />)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("テキスト入力後はボタンが有効化される", async () => {
    render(<MessageInput onSend={vi.fn()} />)
    await userEvent.type(screen.getByRole("textbox"), "こんにちは")
    expect(screen.getByRole("button")).not.toBeDisabled()
  })

  it("ボタンクリックで onSend が呼ばれる", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageInput onSend={onSend} />)
    await userEvent.type(screen.getByRole("textbox"), "テスト送信")
    await userEvent.click(screen.getByRole("button"))
    expect(onSend).toHaveBeenCalledWith("テスト送信")
  })

  it("Ctrl+Enter で送信される", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageInput onSend={onSend} />)
    const textarea = screen.getByRole("textbox")
    await userEvent.type(textarea, "Ctrl送信テスト")
    await userEvent.keyboard("{Control>}{Enter}{/Control}")
    expect(onSend).toHaveBeenCalledWith("Ctrl送信テスト")
  })

  it("送信後テキストエリアがクリアされる", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageInput onSend={onSend} />)
    const textarea = screen.getByRole("textbox")
    await userEvent.type(textarea, "送信後クリア")
    await userEvent.click(screen.getByRole("button"))
    await waitFor(() => {
      expect(textarea).toHaveValue("")
    })
  })

  it("isSending=true のときボタンとテキストエリアが無効化される", () => {
    render(<MessageInput onSend={vi.fn()} isSending={true} />)
    expect(screen.getByRole("button")).toBeDisabled()
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("placeholder が反映される", () => {
    render(<MessageInput onSend={vi.fn()} placeholder="ここに入力" />)
    expect(screen.getByPlaceholderText("ここに入力")).toBeInTheDocument()
  })
})
