import { prisma } from "@/lib/prisma"
import type { MessageTemplate, AIRank } from "@prisma/client"

/**
 * テンプレート変数の型
 */
export interface TemplateVariables {
  氏名: string
  姓: string
  求人名: string
  会社名: string
  日程調整URL: string
  担当者名: string
  応募日: string
}

/**
 * ランクに対応したテンプレートを取得
 * 求人ランク別テンプレートを優先し、なければ共通テンプレートを返す
 */
export async function getTemplateByRank(
  tenantId: string,
  rank: AIRank
): Promise<MessageTemplate | null> {
  // まずランク別テンプレートを検索
  const rankTemplate = await prisma.messageTemplate.findFirst({
    where: { tenantId, rank, isActive: true },
  })
  if (rankTemplate) return rankTemplate

  // なければ共通テンプレート（rank: null）を検索
  const defaultTemplate = await prisma.messageTemplate.findFirst({
    where: { tenantId, rank: null, isActive: true },
  })
  return defaultTemplate
}

/**
 * テナントのテンプレート一覧取得
 */
export async function getTemplates(tenantId: string): Promise<MessageTemplate[]> {
  return prisma.messageTemplate.findMany({
    where: { tenantId },
    orderBy: [{ rank: "asc" }, { createdAt: "asc" }],
  })
}

/**
 * テンプレートの変数を実際の値に置換する
 * 例: {{氏名}} → 田中 太郎
 */
export function replaceVariables(
  template: string,
  variables: Partial<TemplateVariables>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    // {{変数名}} 形式を置換
    result = result.replaceAll(`{{${key}}}`, value ?? "")
  }
  return result
}

/**
 * テンプレート作成
 */
export async function createTemplate(params: {
  tenantId: string
  name: string
  rank?: AIRank | null
  subject?: string | null
  body: string
}): Promise<MessageTemplate> {
  return prisma.messageTemplate.create({
    data: {
      tenantId: params.tenantId,
      name: params.name,
      rank: params.rank ?? null,
      subject: params.subject ?? null,
      body: params.body,
    },
  })
}

/**
 * テンプレート更新
 */
export async function updateTemplate(
  id: string,
  data: Partial<{
    name: string
    rank: AIRank | null
    subject: string | null
    body: string
    isActive: boolean
  }>
): Promise<MessageTemplate> {
  return prisma.messageTemplate.update({
    where: { id },
    data,
  })
}

/**
 * テンプレート削除
 */
export async function deleteTemplate(id: string): Promise<void> {
  await prisma.messageTemplate.delete({ where: { id } })
}
