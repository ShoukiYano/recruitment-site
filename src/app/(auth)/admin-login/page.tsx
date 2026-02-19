"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        userType: "admin",
        subdomain: "system", // SYSTEM_ADMIN 専用
        redirect: false,
      })

      if (result?.error) {
        toast.error("メールアドレスまたはパスワードが正しくありません")
        return
      }

      const session = await getSession()
      const role = session?.user?.role

      if (role === "SYSTEM_ADMIN") {
        router.push("/platform-admin/dashboard")
      } else if (role === "TENANT_ADMIN" || role === "TENANT_USER") {
        router.push("/admin/dashboard")
      } else {
        toast.error("企業・管理者アカウントでログインしてください")
      }
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
              <Briefcase className="size-5 text-[#0D9488]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">企業・管理者ログイン</CardTitle>
          <CardDescription>採用担当者・管理者向けのログインページです</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-[#0D9488] hover:bg-[#0b7a6e]" disabled={isLoading}>
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
