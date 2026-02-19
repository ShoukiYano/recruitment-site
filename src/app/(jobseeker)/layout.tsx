import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "求人検索 | 採用プラットフォーム",
  description: "AIを活用した求人検索・応募プラットフォーム",
}

// 求職者向けレイアウト
export default function JobseekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 hover:underline">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-gray-900 hover:underline">
              利用規約
            </Link>
            <Link href="/tokusho" className="hover:text-gray-900 hover:underline">
              特定商取引法に基づく表記
            </Link>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            © 2024 採用プラットフォーム. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
