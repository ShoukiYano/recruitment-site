import { test, expect } from "@playwright/test"

test.describe("求職者フロー", () => {
  test.beforeEach(async ({ page }) => {
    // 求職者としてログイン
    await page.goto("/login")
    // 求職者ログインフォームを選択（userType=jobseeker）
    const jobseekerTab = page.getByRole("tab", { name: /求職者/ })
    if (await jobseekerTab.isVisible()) {
      await jobseekerTab.click()
    }
    await page.getByLabel("メールアドレス").fill("jobseeker@example.com")
    await page.getByLabel("パスワード").fill("password123")
    await page.getByRole("button", { name: /ログイン/ }).click()
    await page.waitForURL(/\/mypage/, { timeout: 10000 })
  })

  test("ログイン後 mypage が表示される", async ({ page }) => {
    await expect(page).toHaveURL(/\/mypage/)
    await expect(page.getByText(/マイページ|プロフィール/)).toBeVisible({ timeout: 5000 })
  })

  test("メッセージページが表示される", async ({ page }) => {
    await page.goto("/mypage/messages")
    await expect(page).toHaveURL(/\/mypage\/messages/)
    await expect(page.getByText(/メッセージ/)).toBeVisible({ timeout: 5000 })
  })

  test("SessionProvider エラーが発生しない", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/mypage/messages")
    await page.waitForLoadState("networkidle")

    const sessionErrors = errors.filter((e) =>
      e.includes("SessionProvider") || e.includes("useSession")
    )
    expect(sessionErrors).toHaveLength(0)
  })
})
