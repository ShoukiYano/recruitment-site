"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface JobFiltersProps {
  location: string
  employmentType: string
  onLocationChange: (value: string) => void
  onEmploymentTypeChange: (value: string) => void
}

// 勤務地の選択肢
const locations = [
  { value: "", label: "全国" },
  { value: "東京", label: "東京都" },
  { value: "大阪", label: "大阪府" },
  { value: "名古屋", label: "愛知県" },
  { value: "福岡", label: "福岡県" },
  { value: "北海道", label: "北海道" },
  { value: "リモート", label: "フルリモート" },
]

// 雇用形態の選択肢
const employmentTypes = [
  { value: "", label: "すべて" },
  { value: "FULL_TIME", label: "正社員" },
  { value: "PART_TIME", label: "パートタイム" },
  { value: "CONTRACT", label: "契約社員" },
  { value: "FREELANCE", label: "フリーランス" },
  { value: "INTERNSHIP", label: "インターン" },
]

// フィルターコンポーネント
export function JobFilters({
  location,
  employmentType,
  onLocationChange,
  onEmploymentTypeChange,
}: JobFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* 勤務地フィルター */}
      <Select value={location} onValueChange={onLocationChange}>
        <SelectTrigger className="w-[160px] bg-white h-11">
          <SelectValue placeholder="勤務地" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc.value || "all"} value={loc.value || "all"}>
              {loc.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 雇用形態フィルター */}
      <Select value={employmentType} onValueChange={onEmploymentTypeChange}>
        <SelectTrigger className="w-[160px] bg-white h-11">
          <SelectValue placeholder="雇用形態" />
        </SelectTrigger>
        <SelectContent>
          {employmentTypes.map((type) => (
            <SelectItem key={type.value || "all"} value={type.value || "all"}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
