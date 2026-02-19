import React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null
}

export function renderWithProviders(
  ui: React.ReactElement,
  { session = null, ...renderOptions }: RenderWithProvidersOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/** テスト用のモックセッション生成 */
export function mockSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "テストユーザー",
      role: "TENANT_ADMIN",
      tenantId: "tenant-1",
      ...overrides,
    },
  }
}
