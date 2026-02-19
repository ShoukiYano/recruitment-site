"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Send, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "下書き", variant: "secondary" },
  sent: { label: "送付済み", variant: "outline" },
  paid: { label: "入金済み", variant: "default" },
  overdue: { label: "期限超過", variant: "destructive" },
}

// モックデータ
const mockInvoice = {
  id: "inv-001",
  invoiceNumber: "INV-2026-001",
  tenantName: "ABC株式会社",
  amount: 98000,
  tax: 9800,
  total: 107800,
  status: "sent" as const,
  dueDate: "2026-02-28",
  createdAt: "2026-02-01",
  items: [
    { description: "ビジネスプラン 月額利用料（2026年2月）", quantity: 1, unitPrice: 98000, amount: 98000 },
  ],
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const [invoice, setInvoice] = useState(mockInvoice)
  const [isUpdating, setIsUpdating] = useState(false)

  const s = statusLabels[invoice.status]

  async function updateStatus(newStatus: string) {
    setIsUpdating(true)
    try {
      // 実際はAPIを呼び出す
      setInvoice(prev => ({ ...prev, status: newStatus as typeof prev.status }))
      toast.success("ステータスを更新しました")
    } catch {
      toast.error("更新に失敗しました")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/platform-admin/billing">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">請求書詳細</h1>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>

      {/* 請求書情報 */}
      <Card>
        <CardHeader><CardTitle>請求書 {invoice.invoiceNumber}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">請求先</p>
              <p className="font-medium">{invoice.tenantName}</p>
            </div>
            <div>
              <p className="text-gray-500">支払期限</p>
              <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("ja-JP")}</p>
            </div>
            <div>
              <p className="text-gray-500">発行日</p>
              <p className="font-medium">{new Date(invoice.createdAt).toLocaleDateString("ja-JP")}</p>
            </div>
          </div>

          {/* 明細 */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-500">項目</th>
                <th className="text-right py-2 font-medium text-gray-500">数量</th>
                <th className="text-right py-2 font-medium text-gray-500">単価</th>
                <th className="text-right py-2 font-medium text-gray-500">金額</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{item.unitPrice.toLocaleString("ja-JP")}円</td>
                  <td className="py-2 text-right">{item.amount.toLocaleString("ja-JP")}円</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-b">
                <td colSpan={3} className="py-2 text-right text-gray-500">小計</td>
                <td className="py-2 text-right">{invoice.amount.toLocaleString("ja-JP")}円</td>
              </tr>
              <tr className="border-b">
                <td colSpan={3} className="py-2 text-right text-gray-500">消費税（10%）</td>
                <td className="py-2 text-right">{invoice.tax.toLocaleString("ja-JP")}円</td>
              </tr>
              <tr>
                <td colSpan={3} className="py-2 text-right font-bold">合計</td>
                <td className="py-2 text-right font-bold text-lg">{invoice.total.toLocaleString("ja-JP")}円</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* アクション */}
      <Card>
        <CardHeader><CardTitle>操作</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          {invoice.status === "draft" && (
            <Button onClick={() => updateStatus("sent")} disabled={isUpdating} className="bg-[#1E3A5F] hover:bg-[#2d5480]">
              <Send className="h-4 w-4 mr-2" />送付済みにする
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <Button onClick={() => updateStatus("paid")} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />入金済みにする
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />PDF出力
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
