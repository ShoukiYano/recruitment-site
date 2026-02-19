import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user.tenantId) return NextResponse.json({ error: "未認証" }, { status: 401 })
  const settings = await prisma.aISetting.findFirst({
    where: { tenantId: session.user.tenantId, jobId: null },
  })
  const defaultSettings = {
    weights: { skillMatch: 40, experience: 25, education: 15, motivation: 10, responseQuality: 10 },
    thresholds: { s: 85, a: 70, b: 50 },
    requiredSkills: [],
    autoActions: { S: "interview", A: "screening", B: "hold", C: "reject" },
  }
  return NextResponse.json({ settings: settings ?? defaultSettings })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user.tenantId) return NextResponse.json({ error: "未認証" }, { status: 401 })
  const { weights, thresholds, requiredSkills, autoActions } = await request.json()
  const existing = await prisma.aISetting.findFirst({
    where: { tenantId: session.user.tenantId, jobId: null },
  })
  const settings = existing
    ? await prisma.aISetting.update({ where: { id: existing.id }, data: { weights, thresholds, requiredSkills, autoActions } })
    : await prisma.aISetting.create({ data: { tenantId: session.user.tenantId, weights, thresholds, requiredSkills, autoActions } })
  return NextResponse.json({ settings })
}
