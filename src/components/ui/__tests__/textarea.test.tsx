import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Textarea } from "../textarea"

describe("Textarea", () => {
  it("テキストエリアがレンダリングされる", () => {
    render(<Textarea />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("placeholder が設定される", () => {
    render(<Textarea placeholder="入力してください" />)
    expect(screen.getByPlaceholderText("入力してください")).toBeInTheDocument()
  })

  it("disabled が正しく機能する", () => {
    render(<Textarea disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("className が追加される", () => {
    const { container } = render(<Textarea className="custom-class" />)
    expect(container.querySelector("textarea")).toHaveClass("custom-class")
  })

  it("value が反映される", () => {
    render(<Textarea value="テスト" readOnly />)
    expect(screen.getByRole("textbox")).toHaveValue("テスト")
  })
})
