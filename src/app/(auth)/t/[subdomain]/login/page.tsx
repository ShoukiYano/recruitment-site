"use client"

import { useEffect, useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
})

type LoginFormData = z.infer<typeof loginSchema>

interface TenantInfo {
  name: string
  logoUrl: string | null
}

export default function TenantLoginPage() {
  const params = useParams<{ subdomain: string }>()
  const subdomain = params.subdomain
  const router = useRouter()

  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // テナント情報取得
  useEffect(() => {
    fetch(`/api/public/tenant/${subdomain}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        return res.json()
      })
      .then((data) => data && setTenant(data))
      .catch(() => setNotFound(true))
  }, [subdomain])

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        userType: "admin",
        subdomain,          // テナント照合に使用
        redirect: false,
      })

      if (result?.error) {
        toast.error("メールアドレスまたはパスワードが正しくありません")
        return
      }

      const session = await getSession()
      if (session?.user?.role === "TENANT_ADMIN" || session?.user?.role === "TENANT_USER") {
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        toast.error("このページからはログインできません")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // サブドメインが存在しない場合
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-gray-500 text-sm">ページが見つかりませんでした</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt="logo" className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                <Building2 className="size-5 text-[#0D9488]" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {tenant ? tenant.name : "　"}
          </CardTitle>
          <CardDescription>採用管理システム ログイン</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
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
            <Button
              type="submit"
              className="w-full bg-[#0D9488] hover:bg-[#0b7a6e]"
              disabled={isLoading || !tenant}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
