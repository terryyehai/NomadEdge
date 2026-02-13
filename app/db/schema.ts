/**
 * NomadEdge 資料庫 Schema 定義
 *
 * 使用 Drizzle ORM 定義資料表結構。
 * 這裡的每一個欄位最終都會變成 D1（SQLite）資料庫中的一個欄位。
 *
 * 想像這張表就像一本「旅遊打卡簿」：
 * 每一行代表一次打卡紀錄，記錄了地點、座標、照片、心得和 AI 的氛圍描述。
 */

import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// 定義 trips 資料表 —— 儲存所有旅遊打卡紀錄
export const trips = sqliteTable("trips", {
    // 主鍵：每筆紀錄的唯一編號，自動遞增
    id: integer("id").primaryKey({ autoIncrement: true }),

    // 地點名稱，例如「東京鐵塔」、「九份老街」
    locationName: text("location_name").notNull(),

    // 緯度（latitude）—— 地球上的南北位置
    // 例如台北 101 的緯度大約是 25.034
    latitude: real("latitude").notNull(),

    // 經度（longitude）—— 地球上的東西位置
    // 例如台北 101 的經度大約是 121.564
    longitude: real("longitude").notNull(),

    // R2 中的檔案名稱（key）
    // 就像檔案在雲端硬碟中的「路徑」，用來找到上傳的照片
    photoKey: text("photo_key").notNull(),

    // 使用者輸入的旅遊心得筆記（選填）
    userNote: text("user_note"),

    // AI 根據照片自動生成的「氛圍描述」（選填）
    // 例如：「暖陽灑落在古老的石板路上，空氣中瀰漫著咖啡香...」
    aiVibe: text("ai_vibe"),

    // 建立時間，使用 Unix 時間戳（自動填入當前時間）
    createdAt: integer("created_at", { mode: "timestamp" }).default(
        sql`(unixepoch())`
    ),
});

// 匯出型別定義，方便其他檔案使用
// InferSelectModel = 從資料庫「讀取」時的資料型別
// InferInsertModel = 「寫入」資料庫時的資料型別（有些欄位可選填）
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
