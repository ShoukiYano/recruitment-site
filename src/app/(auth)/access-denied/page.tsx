export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">403</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">アクセスが拒否されました</h1>
        <p className="text-sm text-gray-500">
          このページへのアクセス権限がありません。
        </p>
      </div>
    </div>
  )
}
