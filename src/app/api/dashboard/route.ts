import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role === "JOB_SEEKER") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  const tenantId = session.user.tenantId
  if (!tenantId) {
    return NextResponse.json({ error: "テナント情報がありません" }, { status: 403 })
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 統計を並行取得
    const [
      monthlyCount,
      newCount,
      interviewCount,
      offeredCount,
      recentApplications,
      rankCounts,
    ] = await Promise.all([
      // 今月の応募数
      prisma.application.count({
        where: { tenantId, appliedAt: { gte: startOfMonth } },
      }),
      // 未対応（NEW）
      prisma.application.count({
        where: { tenantId, status: "NEW" },
      }),
      // 面接予定
      prisma.application.count({
        where: { tenantId, status: "INTERVIEW_SCHEDULED" },
      }),
      // 採用（OFFERED）
      prisma.application.count({
        where: { tenantId, status: "OFFERED" },
      }),
      // 最新応募者 5件
      prisma.application.findMany({
        where: { tenantId },
        include: {
          job: { select: { title: true } },
          jobSeeker: { select: { name: true } },
          evaluation: { select: { rank: true, score: true } },
        },
        orderBy: { appliedAt: "desc" },
        take: 5,
      }),
      // ランク別件数
      prisma.aiEvaluation.groupBy({
        by: ["rank"],
        where: { application: { tenantId } },
        _count: { rank: true },
      }),
    ])

    // 過去6ヶ月の応募数推移
    const trend: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const count = await prisma.application.count({
        where: {
          tenantId,
          appliedAt: { gte: d, lt: nextD },
        },
      })
      const label = `${d.getMonth() + 1}月`
      trend.push({ month: label, count })
    }

    // ランク分布データ整形
    const rankColorMap: Record<string, string> = {
      S: "#F59E0B",
      A: "#0D9488",
      B: "#6B7280",
      C: "#E5E7EB",
    }
    const rankDistribution = ["S", "A", "B", "C"].map((r) => ({
      name: `${r}ランク`,
      value: rankCounts.find((rc) => rc.rank === r)?._count.rank ?? 0,
      color: rankColorMap[r],
    }))

    // 最新応募者整形
    const recentApplicants = recentApplications.map((app) => ({
      id: app.id,
      name: app.jobSeeker.name,
      job: app.job.title,
      rank: app.evaluation?.rank ?? null,
      score: app.evaluation?.score ?? null,
      date: app.appliedAt.toISOString().split("T")[0],
    }))

    return NextResponse.json({
      stats: {
        monthlyCount,
        newCount,
        interviewCount,
        offeredCount,
      },
      trend,
      rankDistribution,
      recentApplicants,
    })
  } catch (error) {
    console.error("[ダッシュボードAPI] エラー:", error)
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 })
  }
}
