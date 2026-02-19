// プロジェクト共通の型定義
// Prismaが生成した型のre-exportとカスタム型定義

// Prisma生成型のre-export
export type {
  Tenant,
  TenantSetting,
  User,
  JobSeeker,
  Job,
  Application,
  AiEvaluation,
  Message,
  MessageTemplate,
  AISetting,
  BillingPlan,
  TenantBilling,
  Invoice,
} from '@prisma/client'

// Prisma生成Enumのre-export
export {
  UserRole,
  JobStatus,
  EmploymentType,
  ApplicationStatus,
  AIRank,
  MessageSenderType,
  InvoiceStatus,
  BillingPlanType,
} from '@prisma/client'

// リレーションを含むテナント型
export type TenantWithRelations = import('@prisma/client').Tenant & {
  settings: import('@prisma/client').TenantSetting | null
  users: import('@prisma/client').User[]
  jobs: import('@prisma/client').Job[]
}

// リレーションを含む応募型
export type ApplicationWithRelations = import('@prisma/client').Application & {
  job: import('@prisma/client').Job
  jobSeeker: import('@prisma/client').JobSeeker
  evaluation: import('@prisma/client').AiEvaluation | null
}

// リレーションを含む求人型
export type JobWithRelations = import('@prisma/client').Job & {
  tenant: import('@prisma/client').Tenant
  applications: import('@prisma/client').Application[]
}

// AI評価の内訳型
export type EvaluationBreakdown = {
  skillMatch: number
  experience: number
  education: number
  motivation: number
  responseQuality: number
}

// AI設定の重み型
export type AIWeights = {
  skillMatch: number
  experience: number
  education: number
  motivation: number
  responseQuality: number
}

// AI設定の閾値型
export type AIThresholds = {
  s: number
  a: number
  b: number
}
