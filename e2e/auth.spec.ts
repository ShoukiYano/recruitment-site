import { test, expect } from "@playwright/test"

test.describe("認証フロー", () => {
  test("企業管理者がログインしてダッシュボードに遷移する", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("メールアドレス").fill("admin@example.com")
    await page.getByLabel("パスワード").fill("password123")
    await page.getByRole("button", { name: /ログイン/ }).click()

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 })
    await expect(page.getByText(/ダッシュボード/)).toBeVisible()
  })

  test("システム管理者がログインして platform-admin に遷移する", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("メールアドレス").fill("system@example.com")
    await page.getByLabel("パスワード").fill("syspassword123")
    await page.getByRole("button", { name: /ログイン/ }).click()

    await expect(page).toHaveURL(/\/platform-admin/, { timeout: 10000 })
  })

  test("誤ったパスワードでエラーが表示される", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("メールアドレス").fill("admin@example.com")
    await page.getByLabel("パスワード").fill("wrongpassword")
    await page.getByRole("button", { name: /ログイン/ }).click()

    await expect(page.getByText(/パスワード|認証|エラー/)).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
