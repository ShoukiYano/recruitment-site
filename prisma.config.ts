// 環境別の設定ファイルを読み込む
//
// 使い方（Prisma CLI）:
//   ローカル開発・ステージングDB: npx prisma migrate deploy
//   ステージング（CI/CD）:         APP_ENV=staging npx prisma migrate deploy
//   本番:                          APP_ENV=production npx prisma migrate deploy
//
// Windows PowerShell:
//   $env:APP_ENV="production"; npx prisma migrate deploy
import { config } from "dotenv";

const appEnv = process.env.APP_ENV;

if (appEnv === "production") {
  config({ path: ".env.production" });
} else if (appEnv === "staging") {
  config({ path: ".env.staging" });
} else {
  // デフォルト: .env.local（ローカル開発・Next.js dev サーバーと共通）
  config({ path: ".env.local" });
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
});
