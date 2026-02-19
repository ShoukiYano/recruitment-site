import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          採用プラットフォーム
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          AIを活用して、採用プロセスを自動化・最適化。
          候補者の評価からマッチングまで、効率的な採用を実現します。
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/jobs">求人を探す</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">ログイン</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
