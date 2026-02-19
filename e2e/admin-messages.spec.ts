import { test, expect } from "@playwright/test"

test.describe("管理者メッセージページ", () => {
  test.beforeEach(async ({ page }) => {
    // ログイン状態にする
    await page.goto("/login")
    await page.getByLabel("メールアドレス").fill("admin@example.com")
    await page.getByLabel("パスワード").fill("password123")
    await page.getByRole("button", { name: /ログイン/ }).click()
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 })
  })

  test("/admin/messages が正常に表示される", async ({ page }) => {
    await page.goto("/admin/messages")
    await expect(page).toHaveURL(/\/admin\/messages/)
    // ページタイトルまたはヘッダーが表示される
    await expect(page.getByText(/メッセージ/)).toBeVisible({ timeout: 5000 })
  })

  test("SessionProvider エラーが発生しない", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/admin/messages")
    await page.waitForLoadState("networkidle")

    // SessionProvider 関連のエラーがないことを確認
    const sessionErrors = errors.filter((e) =>
      e.includes("SessionProvider") || e.includes("useSession")
    )
    expect(sessionErrors).toHaveLength(0)
  })

  test("コンソールに React エラーが出ない", async ({ page }) => {
    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto("/admin/messages")
    await page.waitForLoadState("networkidle")

    const reactErrors = consoleErrors.filter(
      (e) => e.includes("SessionProvider") || e.includes("useSession must be wrapped")
    )
    expect(reactErrors).toHaveLength(0)
  })
})
