import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// vi.mock はファイル先頭にホイストされるため、
// ファクトリ内で参照する変数は vi.hoisted() で事前に初期化する
const { mockSignOut, mockPush } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockPush: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: mockSignOut,
}))

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/admin/dashboard"),
  useRouter: vi.fn().mockReturnValue({ push: mockPush }),
}))

import { useSession } from "next-auth/react"
import TenantAdminLayout from "../layout"
import type { AppRole } from "@/types/next-auth"

const mockUseSession = vi.mocked(useSession)

function makeSession(name = "テスト管理者") {
  return {
    data: {
      expires: "2099-01-01",
      user: {
        id: "u1",
        name,
        email: "admin@example.com",
        role: "TENANT_ADMIN" as AppRole,
        tenantId: "tenant-1",
      },
    },
    status: "authenticated" as const,
    update: vi.fn(),
  }
}

function renderLayout() {
  return render(
    <TenantAdminLayout>
      <div>メインコンテンツ</div>
    </TenantAdminLayout>
  )
}

describe("TenantAdminLayout ユーザーメニュー", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- 表示テスト ---

  it("セッションなしの場合「管理者」がフォールバック表示される", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() })
    renderLayout()
    expect(screen.getByText("管理者")).toBeInTheDocument()
  })

  it("セッションがある場合、ユーザー名が表示される", () => {
    mockUseSession.mockReturnValue(makeSession("山田太郎"))
    renderLayout()
    expect(screen.getByText("山田太郎")).toBeInTheDocument()
  })

  it("アバターにユーザー名の頭文字が表示される", () => {
    mockUseSession.mockReturnValue(makeSession("田中花子"))
    renderLayout()
    expect(screen.getByText("田")).toBeInTheDocument()
  })

  it("子コンテンツが描画される", () => {
    mockUseSession.mockReturnValue(makeSession())
    renderLayout()
    expect(screen.getByText("メインコンテンツ")).toBeInTheDocument()
  })

  // --- ドロップダウン操作テスト ---

  it("プロフィールをクリックすると /admin/settings/users に遷移する", async () => {
    mockUseSession.mockReturnValue(makeSession("山田太郎"))
    renderLayout()

    await userEvent.click(screen.getByText("山田太郎"))

    const profileItem = await screen.findByText("プロフィール")
    await userEvent.click(profileItem)

    expect(mockPush).toHaveBeenCalledWith("/admin/settings/users")
  })

  it("アカウント設定をクリックすると /admin/settings/ai に遷移する", async () => {
    mockUseSession.mockReturnValue(makeSession("山田太郎"))
    renderLayout()

    await userEvent.click(screen.getByText("山田太郎"))

    const settingsItem = await screen.findByText("アカウント設定")
    await userEvent.click(settingsItem)

    expect(mockPush).toHaveBeenCalledWith("/admin/settings/ai")
  })

  it("ログアウトをクリックすると signOut が /admin-login へのリダイレクトで呼ばれる", async () => {
    mockUseSession.mockReturnValue(makeSession("山田太郎"))
    renderLayout()

    await userEvent.click(screen.getByText("山田太郎"))

    const logoutItem = await screen.findByText("ログアウト")
    await userEvent.click(logoutItem)

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/admin-login" })
  })

  // --- サイドバーナビゲーションテスト ---

  it("サイドバーのナビゲーション項目がすべて表示される", () => {
    mockUseSession.mockReturnValue(makeSession())
    renderLayout()

    expect(screen.getByText("ダッシュボード")).toBeInTheDocument()
    expect(screen.getByText("求人管理")).toBeInTheDocument()
    expect(screen.getByText("応募者一覧")).toBeInTheDocument()
    expect(screen.getByText("メッセージ")).toBeInTheDocument()
    expect(screen.getByText("テンプレート")).toBeInTheDocument()
    expect(screen.getByText("設定")).toBeInTheDocument()
  })

  it("現在のパスに対応するナビ項目がアクティブスタイルを持つ", () => {
    mockUseSession.mockReturnValue(makeSession())
    const { container } = renderLayout()

    const dashboardLink = container.querySelector('a[href="/admin/dashboard"]')
    expect(dashboardLink?.className).toContain("bg-[#0D9488]/10")
  })
})
