"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface JobSearchBarProps {
  defaultValue?: string
  onSearch: (keyword: string) => void
}

// 検索バーコンポーネント
export function JobSearchBar({ defaultValue = "", onSearch }: JobSearchBarProps) {
  const [keyword, setKeyword] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(keyword)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          type="text"
          placeholder="職種、キーワード、企業名で検索..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-10 h-11 bg-white"
        />
      </div>
      <Button
        type="submit"
        className="h-11 px-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
      >
        検索
      </Button>
    </form>
  )
}
