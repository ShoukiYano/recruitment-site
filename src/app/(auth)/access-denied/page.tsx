import { headers } from "next/headers"

export default async function AccessDeniedPage() {
  const headersList = await headers()
  const forwarded = headersList.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? "不明"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <p className="text-6xl font-bold text-gray-200 mb-4">403</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">アクセスが拒否されました</h1>
        <p className="text-sm text-gray-500 mb-6">
          このページへのアクセス権限がありません。
        </p>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-left">
          <p className="text-xs text-gray-400 mb-1">あなたの現在のIPアドレス:</p>
          <code className="block bg-gray-100 p-2 rounded text-sm font-mono text-gray-800 break-all select-all">
            {ip}
          </code>
          <p className="text-xs text-gray-400 mt-2">
            ※管理者の方は、このIPアドレスを環境変数 <code>SYSTEM_ADMIN_IP_WHITELIST</code> に追加してください。
          </p>
        </div>
      </div>
    </div>
  )
}
