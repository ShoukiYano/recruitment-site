import { UserRole } from "@prisma/client"
import "next-auth"
import "next-auth/jwt"

// 求職者は Prisma の UserRole enum に含まれないため、拡張型を定義
export type AppRole = UserRole | "JOB_SEEKER"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: AppRole
      tenantId: string | null
    }
  }
  interface User {
    id: string
    role: AppRole
    tenantId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: AppRole
    tenantId: string | null
  }
}
