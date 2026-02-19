"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

const schema = z.object({
  name: z.string().min(1, "企業名を入力してください"),
  subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/, "半角英数字とハイフンのみ"),
  adminEmail: z.string().email("有効なメールアドレス"),
  adminName: z.string().min(1, "担当者名を入力してください"),
  adminPassword: z.string().min(8, "8文字以上"),
})

type FormData = z.infer<typeof schema>

export default function NewTenantPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("テナント作成に失敗しました")
      toast.success("テナントを作成しました")
      router.push("/platform-admin/tenants")
    } catch {
      toast.error("テナント作成に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規テナント作成</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>企業名</Label>
              <Input {...register("name")} placeholder="ABC株式会社" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>サブドメイン</Label>
              <Input {...register("subdomain")} placeholder="company-a" />
              {errors.subdomain && <p className="text-red-500 text-sm mt-1">{errors.subdomain.message}</p>}
            </div>
            <div>
              <Label>管理者メール</Label>
              <Input {...register("adminEmail")} type="email" />
              {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail.message}</p>}
            </div>
            <div>
              <Label>管理者名</Label>
              <Input {...register("adminName")} />
              {errors.adminName && <p className="text-red-500 text-sm mt-1">{errors.adminName.message}</p>}
            </div>
            <div>
              <Label>初期パスワード</Label>
              <Input {...register("adminPassword")} type="password" />
              {errors.adminPassword && <p className="text-red-500 text-sm mt-1">{errors.adminPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-[#1E3A5F] hover:bg-[#2d5480]" disabled={isLoading}>
              {isLoading ? "作成中..." : "テナントを作成"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
