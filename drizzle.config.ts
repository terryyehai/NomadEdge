/**
 * Drizzle Kit 設定檔
 *
 * Drizzle Kit 是 Drizzle ORM 的 CLI 工具，負責：
 * 1. 根據 schema.ts 自動生成 SQL 遷移檔（migration）
 * 2. 提供資料庫管理介面（drizzle-kit studio）
 *
 * 這裡我們告訴它：
 * - schema 檔案在哪裡
 * - 遷移檔要輸出到哪裡
 * - 使用的資料庫方言是 SQLite（因為 D1 底層就是 SQLite）
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    // Schema 定義檔的位置
    schema: "./app/db/schema.ts",

    // 生成的 SQL 遷移檔輸出目錄
    out: "./drizzle/migrations",

    // D1 底層使用 SQLite，所以方言設為 sqlite
    dialect: "sqlite",
});
