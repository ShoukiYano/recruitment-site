"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Clock,
  CalendarCheck,
  CheckCircle,
} from "lucide-react"

// ランク別バッジ色
const rankColors: Record<string, string> = {
  S: "bg-[#F59E0B] text-white",
  A: "bg-[#0D9488] text-white",
  B: "bg-[#6B7280] text-white",
  C: "bg-[#E5E7EB] text-gray-700",
}

// ステータス表示設定
const statusConfig: Record<string, { label: string; className: string }> = {
  NEW: { label: "新規", className: "bg-blue-100 text-blue-800" },
  SCREENING: { label: "選考中", className: "bg-yellow-100 text-yellow-800" },
  INTERVIEW_SCHEDULED: { label: "面接予定", className: "bg-purple-100 text-purple-800" },
  INTERVIEWED: { label: "面接済", className: "bg-indigo-100 text-indigo-800" },
  OFFERED: { label: "内定", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "不採用", className: "bg-red-100 text-red-800" },
}

// モックデータ型
type Applicant = {
  id: string
  name: string
  email: string
  jobTitle: string
  rank: string
  score: number
  status: string
  appliedAt: string
}

// モックデータ
const mockApplicants: Applicant[] = [
  { id: "1", name: "田中 太郎", email: "tanaka@example.com", jobTitle: "フロントエンドエンジニア", rank: "S", score: 92, status: "INTERVIEW_SCHEDULED", appliedAt: "2026-02-18" },
  { id: "2", name: "佐藤 花子", email: "sato@example.com", jobTitle: "バックエンドエンジニア", rank: "A", score: 78, status: "SCREENING", appliedAt: "2026-02-17" },
  { id: "3", name: "鈴木 一郎", email: "suzuki@example.com", jobTitle: "プロダクトマネージャー", rank: "A", score: 75, status: "NEW", appliedAt: "2026-02-17" },
  { id: "4", name: "高橋 美咲", email: "takahashi@example.com", jobTitle: "デザイナー", rank: "B", score: 63, status: "SCREENING", appliedAt: "2026-02-16" },
  { id: "5", name: "渡辺 健太", email: "watanabe@example.com", jobTitle: "フロントエンドエンジニア", rank: "C", score: 42, status: "REJECTED", appliedAt: "2026-02-16" },
  { id: "6", name: "伊藤 真一", email: "ito@example.com", jobTitle: "インフラエンジニア", rank: "S", score: 88, status: "OFFERED", appliedAt: "2026-02-15" },
  { id: "7", name: "山本 由美", email: "yamamoto@example.com", jobTitle: "バックエンドエンジニア", rank: "B", score: 55, status: "NEW", appliedAt: "2026-02-15" },
  { id: "8", name: "中村 大輔", email: "nakamura@example.com", jobTitle: "フロントエンドエンジニア", rank: "A", score: 71, status: "INTERVIEW_SCHEDULED", appliedAt: "2026-02-14" },
]

// クイック統計
const quickStats = [
  { label: "新規", count: 2, icon: Users, color: "text-blue-600" },
  { label: "選考中", count: 2, icon: Clock, color: "text-yellow-600" },
  { label: "面接予定", count: 2, icon: CalendarCheck, color: "text-purple-600" },
  { label: "内定", count: 1, icon: CheckCircle, color: "text-green-600" },
]

export default function ApplicantsPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [rankFilter, setRankFilter] = useState<string>("all")
  const [rowSelection, setRowSelection] = useState({})

  // フィルタ済みデータ
  const filteredData = useMemo(() => {
    let data = mockApplicants
    if (statusFilter !== "all") {
      data = data.filter((a) => a.status === statusFilter)
    }
    if (rankFilter !== "all") {
      data = data.filter((a) => a.rank === rankFilter)
    }
    return data
  }, [statusFilter, rankFilter])

  // TanStack Table カラム定義
  const columns: ColumnDef<Applicant>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "応募者名",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-gray-500">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "jobTitle",
        header: "応募求人",
      },
      {
        accessorKey: "rank",
        header: "AIランク",
        cell: ({ row }) => (
          <Badge className={rankColors[row.original.rank]}>
            {row.original.rank}
          </Badge>
        ),
      },
      {
        accessorKey: "score",
        header: "AIスコア",
        cell: ({ row }) => <span>{row.original.score}点</span>,
      },
      {
        accessorKey: "status",
        header: "ステータス",
        cell: ({ row }) => {
          const config = statusConfig[row.original.status]
          return <Badge className={config.className}>{config.label}</Badge>
        },
      },
      {
        accessorKey: "appliedAt",
        header: "応募日",
      },
      {
        id: "actions",
        header: "アクション",
        cell: ({ row }) => (
          <Link href={`/admin/applicants/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              詳細
            </Button>
          </Link>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">応募者一覧</h1>

      {/* クイック統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold">{stat.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* フィルタ・検索バー */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* 検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="名前・メールで検索"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              {/* ステータスフィルタ */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ランクフィルタ */}
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ランク" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 一括操作 */}
            {selectedCount > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    一括操作 ({selectedCount}件)
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>選考中に変更</DropdownMenuItem>
                  <DropdownMenuItem>面接予定に変更</DropdownMenuItem>
                  <DropdownMenuItem>内定に変更</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">不採用に変更</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* データテーブル */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left py-3 px-4 font-medium text-gray-500 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              全 {filteredData.length} 件中{" "}
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredData.length
              )}{" "}
              件表示
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
