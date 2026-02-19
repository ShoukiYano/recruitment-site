import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SYSTEM_ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 })
  }
  const tenants = await prisma.tenant.findMany({
    include: {
      settings: true,
      _count: { select: { applications: true, jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ tenants })
}
