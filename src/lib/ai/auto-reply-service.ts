import { prisma } from "@/lib/prisma"
import type { Application } from "@prisma/client"

/** テンプレートの変数置換 */
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

/** ランクに応じた自動返信を送信 */
export async function sendAutoReply(params: {
  application: Application
  rank: "S" | "A" | "B" | "C"
  tenantId: string
}): Promise<void> {
  const { application, rank, tenantId } = params

  const template = await prisma.messageTemplate.findFirst({
    where: { tenantId, rank, isActive: true },
  })

  // テンプレートがない場合はランク別デフォルトメッセージを使用
  const defaultBodies: Record<string, string> = {
    S: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n書類選考の結果、ぜひ面接にお越しいただきたいと思います。\n追って詳細をご連絡いたします。\n\n{{会社名}} 採用担当",
    A: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n書類選考を通過されました。引き続き選考を進めさせていただきます。\n追って詳細をご連絡いたします。\n\n{{会社名}} 採用担当",
    B: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n応募書類を確認いたしました。現在選考中ですので、しばらくお待ちください。\n\n{{会社名}} 採用担当",
    C: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n誠に恐れ入りますが、今回は採用要件との兼ね合いから、ご期待に添えない結果となりました。\n今後のご活躍を心よりお祈り申し上げます。\n\n{{会社名}} 採用担当",
  }

  const bodyText = template?.body ?? defaultBodies[rank] ?? defaultBodies["C"]

  const [jobSeeker, job, tenant] = await Promise.all([
    prisma.jobSeeker.findUnique({ where: { id: application.jobSeekerId } }),
    prisma.job.findUnique({ where: { id: application.jobId } }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ])
  if (!jobSeeker || !job || !tenant) return

  const variables: Record<string, string> = {
    氏名: jobSeeker.name,
    姓: jobSeeker.name.split(" ")[0] || jobSeeker.name,
    求人名: job.title,
    会社名: tenant.name,
    担当者名: "採用担当",
    応募日: new Date(application.appliedAt).toLocaleDateString("ja-JP"),
    日程調整URL: "",
  }

  const body = replaceTemplateVariables(bodyText, variables)

  await prisma.message.create({
    data: {
      tenantId,
      applicationId: application.id,
      senderId: application.jobSeekerId, // システム送信者
      senderType: "SYSTEM",
      content: body,
      isAutoReply: true,
    },
  })

  console.log(`[自動返信] applicationId=${application.id} rank=${rank} 送信完了`)
}
