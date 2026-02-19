"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt } from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  tenantName: string
  amount: number
  status: "draft" | "sent" | "paid" | "overdue"
  dueDate: string
  createdAt: string
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "下書き", variant: "secondary" },
  sent: { label: "送付済み", variant: "outline" },
  paid: { label: "入金済み", variant: "default" },
  overdue: { label: "期限超過", variant: "destructive" },
}

// モックデータ（実際はAPIから取得）
const mockInvoices: Invoice[] = [
  { id: "inv-001", invoiceNumber: "INV-2026-001", tenantName: "ABC株式会社", amount: 98000, status: "paid", dueDate: "2026-01-31", createdAt: "2026-01-01" },
  { id: "inv-002", invoiceNumber: "INV-2026-002", tenantName: "XYZ株式会社", amount: 29800, status: "sent", dueDate: "2026-02-28", createdAt: "2026-02-01" },
  { id: "inv-003", invoiceNumber: "INV-2026-003", tenantName: "テスト株式会社", amount: 198000, status: "overdue", dueDate: "2026-01-15", createdAt: "2026-01-01" },
  { id: "inv-004", invoiceNumber: "INV-2026-004", tenantName: "DEF株式会社", amount: 98000, status: "draft", dueDate: "2026-03-31", createdAt: "2026-02-15" },
]

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">課金・請求管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            請求書一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">請求書番号</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">テナント名</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">金額</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">ステータス</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">期限</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => {
                const s = statusLabels[invoice.status]
                return (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium">{invoice.tenantName}</td>
                    <td className="py-3 px-4 text-right">{invoice.amount.toLocaleString("ja-JP")}円</td>
                    <td className="py-3 px-4">
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/platform-admin/billing/${invoice.id}`}>
                        <Button variant="ghost" size="sm">詳細</Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
