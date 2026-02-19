import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))
vi.stubGlobal("fetch", mockFetch)

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}))

import JobsPage from "../page"

const makeJobs = (overrides: object[] = []) =>
  overrides.length > 0
    ? overrides
    : [
        {
          id: "job-1",
          title: "フロントエンドエンジニア",
          status: "PUBLISHED",
          publishedAt: "2026-01-15T00:00:00.000Z",
          createdAt: "2026-01-10T00:00:00.000Z",
          _count: { applications: 5 },
        },
        {
          id: "job-2",
          title: "バックエンドエンジニア",
          status: "DRAFT",
          publishedAt: null,
          createdAt: "2026-01-20T00:00:00.000Z",
          _count: { applications: 0 },
        },
      ]

describe("管理画面 求人一覧ページ", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("ロード中スピナーが表示される", () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // 解決しない Promise
    render(<JobsPage />)
    expect(screen.getByText("読み込み中...")).toBeInTheDocument()
  })

  it("APIから取得した求人一覧が表示される", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: makeJobs(), total: 2 }),
    })
    render(<JobsPage />)

    await waitFor(() => {
      expect(screen.getByText("フロントエンドエンジニア")).toBeInTheDocument()
      expect(screen.getByText("バックエンドエンジニア")).toBeInTheDocument()
    })
  })

  it("管理用エンドポイント /api/jobs?admin=true を呼ぶ", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: makeJobs(), total: 2 }),
    })
    render(<JobsPage />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/jobs?admin=true")
    })
  })

  it("DRAFT ステータスの求人も表示される", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: makeJobs(), total: 2 }),
    })
    render(<JobsPage />)

    await waitFor(() => {
      expect(screen.getByText("下書き")).toBeInTheDocument()
    })
  })

  it("求人がない場合は空メッセージを表示する", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [], total: 0 }),
    })
    render(<JobsPage />)

    await waitFor(() => {
      expect(screen.getByText(/求人がありません/)).toBeInTheDocument()
    })
  })

  it("Switch をクリックすると PATCH /api/jobs/[id] が呼ばれる", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: makeJobs(), total: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "job-1", status: "DRAFT" }),
      })

    render(<JobsPage />)
    await waitFor(() => screen.getByText("フロントエンドエンジニア"))

    const switches = screen.getAllByRole("switch")
    await userEvent.click(switches[0]) // 最初の求人（PUBLISHED）を DRAFT へ

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/jobs/job-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "DRAFT" }),
        })
      )
    })
  })

  it("DRAFT の Switch をクリックすると PUBLISHED に変わる", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: makeJobs(), total: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "job-2", status: "PUBLISHED" }),
      })

    render(<JobsPage />)
    await waitFor(() => screen.getByText("バックエンドエンジニア"))

    const switches = screen.getAllByRole("switch")
    await userEvent.click(switches[1]) // 2番目（DRAFT）を PUBLISHED へ

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/jobs/job-2",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "PUBLISHED" }),
        })
      )
    })
  })

  it("応募数が表示される", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: makeJobs(), total: 2 }),
    })
    render(<JobsPage />)

    await waitFor(() => {
      expect(screen.getByText("5件")).toBeInTheDocument()
      expect(screen.getByText("0件")).toBeInTheDocument()
    })
  })
})
