import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
        userType: { label: "ユーザータイプ", type: "text" },
        subdomain: { label: "サブドメイン", type: "text" }, // テナント固有ログイン用
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        if (credentials.userType === "jobseeker") {
          // 求職者認証
          const jobSeeker = await prisma.jobSeeker.findUnique({
            where: { email: credentials.email },
          })
          if (!jobSeeker || !jobSeeker.isActive) return null
          const isValid = await bcrypt.compare(credentials.password, jobSeeker.passwordHash)
          if (!isValid) return null
          return {
            id: jobSeeker.id,
            email: jobSeeker.email,
            name: jobSeeker.name,
            role: "JOB_SEEKER" as const,
            tenantId: null,
          }
        } else {
          // 管理者認証
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          if (!user || !user.isActive) return null

          // アカウントロックチェック
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            return null
          }

          const subdomain = credentials.subdomain ?? ""

          if (subdomain === "system" || subdomain === "") {
            // /admin-login 経由 → SYSTEM_ADMIN のみ許可
            if (user.role !== "SYSTEM_ADMIN") return null
          } else {
            // /t/{subdomain}/login 経由 → テナントユーザーのみ許可
            if (user.role === "SYSTEM_ADMIN") return null

            // ユーザーが指定テナントに所属しているか照合
            const tenant = await prisma.tenant.findUnique({
              where: { subdomain },
              select: { id: true },
            })
            if (!tenant) return null
            if (user.tenantId !== tenant.id) return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

          if (!isValid) {
            // ログイン失敗カウントを増加（5回で30分ロック）
            const newFailCount = (user.loginFailCount ?? 0) + 1
            await prisma.user.update({
              where: { id: user.id },
              data: newFailCount >= 5
                ? { loginFailCount: newFailCount, lockedUntil: new Date(Date.now() + 30 * 60 * 1000) }
                : { loginFailCount: newFailCount },
            })
            return null
          }

          // ログイン成功 → 失敗カウントをリセット
          await prisma.user.update({
            where: { id: user.id },
            data: { loginFailCount: 0, lockedUntil: null },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.tenantId = token.tenantId
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  secret: process.env.NEXTAUTH_SECRET,
}
