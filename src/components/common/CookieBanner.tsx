"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) setShow(true)
  }, [])

  if (!show) return null

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 text-center sm:text-left">
          当サイトではサービス改善のためCookieを使用しています。詳細は{" "}
          <Link href="/privacy" className="text-[#1E3A5F] underline hover:text-[#2d5480]">
            プライバシーポリシー
          </Link>
          をご確認ください。
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
          >
            必須のみ
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-md hover:bg-[#2d5480] transition-colors"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  )
}
