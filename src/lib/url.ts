/**
 * ベースURL取得（環境変数 NEXT_PUBLIC_BASE_URL を使用）
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

/**
 * テナント専用採用ページURL
 * 例: https://recruitment-site-inky.vercel.app/t/company-a/jobs
 */
export function getTenantJobsUrl(subdomain: string): string {
  return `${getBaseUrl()}/t/${subdomain}/jobs`
}

/**
 * テナント管理者ログインURL
 * 例: https://recruitment-site-inky.vercel.app/t/company-a/login
 */
export function getTenantLoginUrl(subdomain: string): string {
  return `${getBaseUrl()}/t/${subdomain}/login`
}

/**
 * システム管理者ログインURL
 */
export function getAdminLoginUrl(): string {
  return `${getBaseUrl()}/admin-login`
}

/**
 * 全社公開求人一覧URL
 */
export function getPublicJobsUrl(): string {
  return `${getBaseUrl()}/jobs`
}
