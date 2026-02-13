/**
 * 資料庫連線工具函式
 *
 * 這個檔案提供了一個簡單的方式來建立 Drizzle ORM 的資料庫連線。
 * 在 Cloudflare Workers/Pages 中，資料庫連線不是「常駐」的，
 * 而是每次請求時透過環境變數（binding）取得。
 *
 * 所以我們需要一個工廠函式（factory function），
 * 每次傳入 D1 binding，回傳一個 Drizzle 資料庫實例。
 */

import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

// 建立並回傳一個 Drizzle 資料庫實例
// 參數 d1: Cloudflare D1 資料庫的 binding（透過 env.DB 取得）
export function getDb(d1: D1Database): DrizzleD1Database<typeof schema> {
    return drizzle(d1, { schema });
}

// 重新匯出 schema，方便其他地方引用
export { schema };
