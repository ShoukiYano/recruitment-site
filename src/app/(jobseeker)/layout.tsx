import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "求人検索 | AI採用プラットフォーム",
  description: "AIを活用した求人検索・応募プラットフォーム",
}

// 求職者向けレイアウト
export default function JobseekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-[#F9FAFB]">{children}</div>
}
