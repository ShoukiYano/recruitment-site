import { prisma } from "@/lib/prisma"
import { getOpenAIClient } from "./openai-client"
import { buildEvaluationPrompt } from "./prompts/evaluation-prompt"
import type { Application, Job, AISetting } from "@prisma/client"

export interface EvaluationResult {
  rank: "S" | "A" | "B" | "C"
  score: number
  breakdown: { skillMatch: number; experience: number; education: number; motivation: number; responseQuality: number }
  aiComment: string
}

/** スコアからランクを判定 */
function determineRank(score: number, thresholds: any): "S" | "A" | "B" | "C" {
  if (score >= (thresholds.s ?? 85)) return "S"
  if (score >= (thresholds.a ?? 70)) return "A"
  if (score >= (thresholds.b ?? 50)) return "B"
  return "C"
}

/** OpenAI 利用不可時のフォールバック評価（応募内容の文字数・キーワードで簡易スコアリング） */
function fallbackEvaluate(application: Application, thresholds: any): EvaluationResult {
  const formData = application.formData as Record<string, string> | null ?? {}
  const totalLength = Object.values(formData).join("").length
  // 文字数が多いほど意欲が高いとみなし 40〜80点の範囲でスコア付け
  const score = Math.min(80, Math.max(40, Math.floor(totalLength / 10) + 40))
  const rank = determineRank(score, thresholds)
  console.log(`[AI評価] フォールバック評価 applicationId=${application.id} score=${score} rank=${rank}`)
  return {
    rank,
    score,
    breakdown: { skillMatch: score, experience: score, education: score, motivation: score, responseQuality: score },
    aiComment: "AIサービスが一時的に利用できないため、簡易評価を実施しました。",
  }
}

/** 応募者をAI評価（3回リトライ） */
export async function evaluateApplication(params: {
  application: Application
  job: Job
  aiSettings: AISetting
}): Promise<EvaluationResult> {
  const { application, job, aiSettings } = params
  const openai = getOpenAIClient()
  const weights = aiSettings.weights as any
  const thresholds = aiSettings.thresholds as any
  const requiredSkills = (aiSettings.requiredSkills as string[]) || []

  const prompt = buildEvaluationPrompt({
    job: { title: job.title, description: job.description, requirements: job.requirements, employmentType: job.employmentType },
    application: { formData: application.formData },
    weights: {
      skillMatch: weights.skillMatch ?? 40,
      experience: weights.experience ?? 25,
      education: weights.education ?? 15,
      motivation: weights.motivation ?? 10,
      responseQuality: weights.responseQuality ?? 10,
    },
    requiredSkills,
  })

  let lastError: Error | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      })
      const content = response.choices[0]?.message?.content
      if (!content) throw new Error("OpenAIからのレスポンスが空です")
      const result = JSON.parse(content)
      const score = Math.min(100, Math.max(0, result.score))
      const rank = determineRank(score, thresholds)
      console.log(`[AI評価] applicationId=${application.id} score=${score} rank=${rank} tokens=${response.usage?.total_tokens}`)
      return { rank, score, breakdown: result.breakdown, aiComment: result.aiComment }
    } catch (error) {
      lastError = error as Error
      console.error(`[AI評価エラー] 試行${attempt}/3:`, error)
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt))
    }
  }
  throw lastError || new Error("AI評価に失敗しました")
}

/** 評価を実行してDBに保存 */
export async function runEvaluation(applicationId: string): Promise<void> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  })
  if (!application) throw new Error("応募が見つかりません")

  const aiSettings = await prisma.aISetting.findFirst({
    where: { tenantId: application.tenantId, OR: [{ jobId: application.jobId }, { jobId: null }] },
    orderBy: { jobId: "desc" },
  })

  const defaultSettings = {
    id: "default", tenantId: application.tenantId, jobId: null,
    weights: { skillMatch: 40, experience: 25, education: 15, motivation: 10, responseQuality: 10 },
    thresholds: { s: 85, a: 70, b: 50 },
    requiredSkills: [], autoActions: {},
    createdAt: new Date(), updatedAt: new Date(),
  }

  const settings = (aiSettings ?? defaultSettings) as any
  const thresholds = settings.thresholds ?? { s: 85, a: 70, b: 50 }

  let result: EvaluationResult
  try {
    result = await evaluateApplication({
      application, job: application.job, aiSettings: settings,
    })
  } catch (error: any) {
    // 429 クォータ超過 / 認証エラー / ネットワーク障害はフォールバック評価へ
    const isQuotaError = error?.status === 429 || error?.code === "insufficient_quota"
    const isAuthError = error?.status === 401
    if (isQuotaError || isAuthError || !process.env.OPENAI_API_KEY) {
      console.warn(`[AI評価] OpenAI 利用不可（${error?.code ?? "unknown"}）→ フォールバック評価に切り替えます`)
      result = fallbackEvaluate(application, thresholds)
    } else {
      console.error("[AI評価] 評価失敗:", error)
      await prisma.application.update({ where: { id: applicationId }, data: { status: "SCREENING" } })
      throw error
    }
  }

  await prisma.aiEvaluation.upsert({
    where: { applicationId },
    update: { rank: result.rank, score: result.score, breakdown: result.breakdown, aiComment: result.aiComment, evaluatedAt: new Date() },
    create: { applicationId, rank: result.rank, score: result.score, breakdown: result.breakdown, aiComment: result.aiComment },
  })
  const { sendAutoReply } = await import("./auto-reply-service")
  await sendAutoReply({ application, rank: result.rank, tenantId: application.tenantId })
}
