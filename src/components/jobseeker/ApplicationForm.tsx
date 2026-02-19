"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"

// バリデーションスキーマ
const applicationSchema = z.object({
  // Step 1: 基本情報
  lastName: z.string().min(1, "姓を入力してください"),
  firstName: z.string().min(1, "名を入力してください"),
  lastNameKana: z.string().min(1, "セイを入力してください"),
  firstNameKana: z.string().min(1, "メイを入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  phone: z.string().min(10, "正しい電話番号を入力してください"),
  birthDate: z.string().min(1, "生年月日を入力してください"),
  // Step 2: 職務経歴
  education: z.string().min(1, "最終学歴を選択してください"),
  employmentStatus: z.string().min(1, "就業状況を選択してください"),
  experienceYears: z.string().min(1, "経験年数を選択してください"),
  jobCategory: z.string().min(1, "職種を入力してください"),
  // Step 3: 自己PR
  selfPR: z.string().min(10, "自己PRを10文字以上入力してください"),
  motivation: z.string().min(10, "志望動機を10文字以上入力してください"),
  consentGiven: z.boolean().refine(val => val === true, {
    message: "個人情報の取り扱いに同意してください",
  }),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  jobTitle: string
  companyName: string
  onSubmit: (data: ApplicationFormData) => Promise<void>
  isSubmitting?: boolean
}

// 3ステップ応募フォーム
export function ApplicationForm({
  jobTitle,
  companyName,
  onSubmit,
  isSubmitting = false,
}: ApplicationFormProps) {
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: "onBlur",
  })

  const formValues = watch()

  // ステップ別バリデーション
  const validateStep = async (currentStep: number) => {
    const fields: Record<number, (keyof ApplicationFormData)[]> = {
      1: ["lastName", "firstName", "lastNameKana", "firstNameKana", "email", "phone", "birthDate"],
      2: ["education", "employmentStatus", "experienceYears", "jobCategory"],
      3: ["selfPR", "motivation", "consentGiven"],
    }
    return trigger(fields[currentStep])
  }

  const handleNext = async () => {
    const isValid = await validateStep(step)
    if (isValid) setStep(step + 1)
  }

  const handleBack = () => setStep(step - 1)

  // ステップインジケーター
  const steps = [
    { num: 1, label: "基本情報" },
    { num: 2, label: "職務経歴" },
    { num: 3, label: "自己PR・確認" },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 求人情報 */}
      <div className="mb-6 p-4 bg-[#0D9488]/5 rounded-lg border border-[#0D9488]/20">
        <p className="text-sm text-gray-500">応募先</p>
        <p className="font-bold text-gray-900">{jobTitle}</p>
        <p className="text-sm text-gray-600">{companyName}</p>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num
                    ? "bg-[#0D9488] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.num}
              </div>
              <span className="text-xs mt-1 text-gray-500">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 mb-5 ${
                  step > s.num ? "bg-[#0D9488]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: 基本情報 */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastName">姓 <span className="text-red-500">*</span></Label>
                <Input id="lastName" {...register("lastName")} placeholder="山田" className="mt-1" />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <Label htmlFor="firstName">名 <span className="text-red-500">*</span></Label>
                <Input id="firstName" {...register("firstName")} placeholder="太郎" className="mt-1" />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastNameKana">セイ <span className="text-red-500">*</span></Label>
                <Input id="lastNameKana" {...register("lastNameKana")} placeholder="ヤマダ" className="mt-1" />
                {errors.lastNameKana && <p className="text-sm text-red-500 mt-1">{errors.lastNameKana.message}</p>}
              </div>
              <div>
                <Label htmlFor="firstNameKana">メイ <span className="text-red-500">*</span></Label>
                <Input id="firstNameKana" {...register("firstNameKana")} placeholder="タロウ" className="mt-1" />
                {errors.firstNameKana && <p className="text-sm text-red-500 mt-1">{errors.firstNameKana.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" {...register("email")} placeholder="example@email.com" className="mt-1" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">電話番号 <span className="text-red-500">*</span></Label>
              <Input id="phone" type="tel" {...register("phone")} placeholder="090-1234-5678" className="mt-1" />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <Label htmlFor="birthDate">生年月日 <span className="text-red-500">*</span></Label>
              <Input id="birthDate" type="date" {...register("birthDate")} className="mt-1" />
              {errors.birthDate && <p className="text-sm text-red-500 mt-1">{errors.birthDate.message}</p>}
            </div>
          </div>
        )}

        {/* Step 2: 職務経歴 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">職務経歴</h3>
            <div>
              <Label>最終学歴 <span className="text-red-500">*</span></Label>
              <Select
                value={formValues.education}
                onValueChange={(v) => setValue("education", v, { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1 w-full bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">高等学校卒業</SelectItem>
                  <SelectItem value="vocational">専門学校卒業</SelectItem>
                  <SelectItem value="associate">短期大学卒業</SelectItem>
                  <SelectItem value="bachelor">大学卒業</SelectItem>
                  <SelectItem value="master">大学院修了（修士）</SelectItem>
                  <SelectItem value="doctor">大学院修了（博士）</SelectItem>
                </SelectContent>
              </Select>
              {errors.education && <p className="text-sm text-red-500 mt-1">{errors.education.message}</p>}
            </div>
            <div>
              <Label>就業状況 <span className="text-red-500">*</span></Label>
              <Select
                value={formValues.employmentStatus}
                onValueChange={(v) => setValue("employmentStatus", v, { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1 w-full bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">在職中</SelectItem>
                  <SelectItem value="unemployed">離職中</SelectItem>
                  <SelectItem value="freelance">フリーランス</SelectItem>
                  <SelectItem value="student">学生</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentStatus && <p className="text-sm text-red-500 mt-1">{errors.employmentStatus.message}</p>}
            </div>
            <div>
              <Label>経験年数 <span className="text-red-500">*</span></Label>
              <Select
                value={formValues.experienceYears}
                onValueChange={(v) => setValue("experienceYears", v, { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1 w-full bg-white">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">未経験</SelectItem>
                  <SelectItem value="1-2">1〜2年</SelectItem>
                  <SelectItem value="3-5">3〜5年</SelectItem>
                  <SelectItem value="6-9">6〜9年</SelectItem>
                  <SelectItem value="10+">10年以上</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceYears && <p className="text-sm text-red-500 mt-1">{errors.experienceYears.message}</p>}
            </div>
            <div>
              <Label htmlFor="jobCategory">職種 <span className="text-red-500">*</span></Label>
              <Input
                id="jobCategory"
                {...register("jobCategory")}
                placeholder="例: フロントエンドエンジニア"
                className="mt-1"
              />
              {errors.jobCategory && <p className="text-sm text-red-500 mt-1">{errors.jobCategory.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: 自己PR・確認 */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">自己PR・志望動機</h3>
            <div>
              <Label htmlFor="selfPR">自己PR <span className="text-red-500">*</span></Label>
              <textarea
                id="selfPR"
                {...register("selfPR")}
                rows={5}
                placeholder="これまでの経験やスキルをアピールしてください"
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              />
              {errors.selfPR && <p className="text-sm text-red-500 mt-1">{errors.selfPR.message}</p>}
            </div>
            <div>
              <Label htmlFor="motivation">志望動機 <span className="text-red-500">*</span></Label>
              <textarea
                id="motivation"
                {...register("motivation")}
                rows={5}
                placeholder="この企業・求人への志望動機をお書きください"
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              />
              {errors.motivation && <p className="text-sm text-red-500 mt-1">{errors.motivation.message}</p>}
            </div>

            {/* 確認セクション */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">入力内容の確認</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-24 text-gray-500 shrink-0">氏名</dt>
                  <dd>{formValues.lastName} {formValues.firstName}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500 shrink-0">フリガナ</dt>
                  <dd>{formValues.lastNameKana} {formValues.firstNameKana}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500 shrink-0">メール</dt>
                  <dd>{formValues.email}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500 shrink-0">電話番号</dt>
                  <dd>{formValues.phone}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500 shrink-0">職種</dt>
                  <dd>{formValues.jobCategory}</dd>
                </div>
              </dl>
            </div>

            {/* 個人情報同意 */}
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("consentGiven")}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className="text-sm text-gray-700">
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0D9488] underline">
                    個人情報の取り扱い
                  </a>
                  について同意します。入力した情報は応募先企業に提供されます。{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.consentGiven && (
                <p className="text-sm text-red-500 mt-2 ml-7">{errors.consentGiven.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="size-4" />
              戻る
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
            >
              次へ
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
            >
              <Send className="size-4" />
              {isSubmitting ? "送信中..." : "応募する"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
