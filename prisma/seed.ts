import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { PrismaClient, UserRole, JobStatus, EmploymentType, BillingPlanType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('シードデータの投入を開始します...')

  // 料金プランの作成
  await prisma.billingPlan.upsert({
    where: { type: BillingPlanType.STARTER },
    update: {},
    create: {
      name: 'スターター',
      type: BillingPlanType.STARTER,
      monthlyPrice: 30000,
      applicationLimit: 100,
      jobLimit: 5,
      userLimit: 2,
      features: { aiEvaluation: true, autoReply: true, customBranding: false },
    },
  })

  await prisma.billingPlan.upsert({
    where: { type: BillingPlanType.BUSINESS },
    update: {},
    create: {
      name: 'ビジネス',
      type: BillingPlanType.BUSINESS,
      monthlyPrice: 100000,
      applicationLimit: 500,
      jobLimit: 20,
      userLimit: 10,
      features: { aiEvaluation: true, autoReply: true, customBranding: true, slackNotification: true },
    },
  })

  await prisma.billingPlan.upsert({
    where: { type: BillingPlanType.ENTERPRISE },
    update: {},
    create: {
      name: 'エンタープライズ',
      type: BillingPlanType.ENTERPRISE,
      monthlyPrice: null,
      applicationLimit: null,
      jobLimit: null,
      userLimit: null,
      features: { aiEvaluation: true, autoReply: true, customBranding: true, slackNotification: true, dedicatedSupport: true },
    },
  })

  // システム管理者
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'システム管理者',
      passwordHash: adminPassword,
      role: UserRole.SYSTEM_ADMIN,
    },
  })

  // テナントA
  const tenantA = await prisma.tenant.upsert({
    where: { subdomain: 'company-a' },
    update: {},
    create: {
      name: 'ABC株式会社',
      subdomain: 'company-a',
      plan: BillingPlanType.BUSINESS,
    },
  })

  await prisma.tenantSetting.upsert({
    where: { tenantId: tenantA.id },
    update: {},
    create: {
      tenantId: tenantA.id,
      primaryColor: '#0D9488',
    },
  })

  const tenantAPassword = await bcrypt.hash('tenant123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@company-a.com' },
    update: {},
    create: {
      email: 'admin@company-a.com',
      name: '田中太郎',
      passwordHash: tenantAPassword,
      role: UserRole.TENANT_ADMIN,
      tenantId: tenantA.id,
    },
  })

  // テナントAの求人
  await prisma.job.createMany({
    data: [
      {
        tenantId: tenantA.id,
        title: 'シニアフルスタックエンジニア',
        description: 'Next.jsとPrismaを使ったWebアプリケーション開発',
        requirements: { required: ['TypeScript', 'React', 'Node.js'], preferred: ['AWS', 'Docker'] },
        benefits: { salary: '600-900万円', vacation: '年間120日以上' },
        employmentType: EmploymentType.FULL_TIME,
        location: '東京都渋谷区',
        salaryMin: 600,
        salaryMax: 900,
        isRemote: true,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        tenantId: tenantA.id,
        title: 'プロダクトマネージャー',
        description: 'SaaSプロダクトの企画・開発推進',
        requirements: { required: ['プロダクト開発経験3年以上'], preferred: ['SaaS業界経験'] },
        benefits: { salary: '700-1000万円', vacation: '年間125日以上' },
        employmentType: EmploymentType.FULL_TIME,
        location: '東京都渋谷区',
        salaryMin: 700,
        salaryMax: 1000,
        isRemote: false,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  })

  // テナントAのデフォルト返信テンプレート
  const defaultTemplates = [
    {
      name: "Sランク自動返信（面接招待）",
      rank: "S" as const,
      subject: "【{{求人名}}】面接のご案内",
      body: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n書類選考の結果、ぜひ面接にお越しいただきたいと思います。\n追って日程調整のご連絡をいたします。\n\n{{会社名}} 採用担当",
    },
    {
      name: "Aランク自動返信（書類通過）",
      rank: "A" as const,
      subject: "【{{求人名}}】書類選考通過のご連絡",
      body: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n書類選考を通過されました。引き続き選考を進めさせていただきます。\n追って詳細をご連絡いたします。\n\n{{会社名}} 採用担当",
    },
    {
      name: "Bランク自動返信（選考中）",
      rank: "B" as const,
      subject: "【{{求人名}}】応募受付のご確認",
      body: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n応募書類を確認いたしました。現在選考中ですので、しばらくお待ちください。\n選考結果は追ってご連絡いたします。\n\n{{会社名}} 採用担当",
    },
    {
      name: "Cランク自動返信（お見送り）",
      rank: "C" as const,
      subject: "【{{求人名}}】選考結果のご連絡",
      body: "{{氏名}} 様\n\n「{{求人名}}」にご応募いただきありがとうございます。\n\n誠に恐れ入りますが、今回は採用要件との兼ね合いから、ご期待に添えない結果となりました。\nご応募いただいた熱意に感謝申し上げます。今後のご活躍を心よりお祈り申し上げます。\n\n{{会社名}} 採用担当",
    },
  ]

  for (const t of defaultTemplates) {
    const existing = await prisma.messageTemplate.findFirst({
      where: { tenantId: tenantA.id, rank: t.rank },
    })
    if (!existing) {
      await prisma.messageTemplate.create({
        data: { tenantId: tenantA.id, ...t, isActive: true },
      })
    }
  }

  // テナントB
  const tenantB = await prisma.tenant.upsert({
    where: { subdomain: 'company-b' },
    update: {},
    create: {
      name: 'XYZ株式会社',
      subdomain: 'company-b',
      plan: BillingPlanType.STARTER,
    },
  })

  await prisma.tenantSetting.upsert({
    where: { tenantId: tenantB.id },
    update: {},
    create: {
      tenantId: tenantB.id,
      primaryColor: '#1E3A5F',
    },
  })

  // 求職者
  const seekerPassword = await bcrypt.hash('seeker123', 12)
  await prisma.jobSeeker.upsert({
    where: { email: 'yamada@example.com' },
    update: {},
    create: {
      email: 'yamada@example.com',
      name: '山田花子',
      phone: '090-1234-5678',
      passwordHash: seekerPassword,
      profile: { skills: ['TypeScript', 'React', 'Node.js'], experienceYears: 5 },
    },
  })

  console.log('シードデータの投入が完了しました')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
