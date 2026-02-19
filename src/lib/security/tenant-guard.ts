// テナントアクセス権限チェック
export function assertTenantAccess(
  userTenantId: string | null,
  userRole: string,
  targetTenantId: string
): void {
  if (userRole === "SYSTEM_ADMIN") return // システム管理者は全テナントアクセス可
  if (userTenantId !== targetTenantId) {
    throw new Error("このテナントへのアクセス権限がありません")
  }
}

// システム管理者チェック
export function assertSystemAdmin(userRole: string): void {
  if (userRole !== "SYSTEM_ADMIN") {
    throw new Error("システム管理者権限が必要です")
  }
}

// テナント管理者チェック
export function assertTenantAdmin(userRole: string): void {
  if (userRole !== "TENANT_ADMIN" && userRole !== "SYSTEM_ADMIN") {
    throw new Error("テナント管理者権限が必要です")
  }
}
