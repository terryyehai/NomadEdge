/**
 * 新增打卡 API 路由（Resource Route）
 *
 * 這是一個「純後端」路由，不渲染 UI，只處理表單提交。
 * 當使用者在 Modal 中填完表單按「打卡」後，表單資料會被送到這裡。
 *
 * 完整流程：
 * 1. 解析 multipart/form-data（包含圖片檔案和文字欄位）
 * 2. 將圖片上傳到 R2 儲存桶
 * 3. 呼叫 Workers AI（LLaVA 模型）分析圖片氛圍
 * 4. 將打卡紀錄（含 AI 描述）寫入 D1 資料庫
 * 5. 回傳結果
 */

import type { Route } from "./+types/trips.new";
import { getDb } from "~/db";
import { trips } from "~/db/schema";
import { data } from "react-router";

// ===== Action：處理 POST 請求 =====
export async function action({ request, context }: Route.ActionArgs) {
    try {
        // 1. 解析 multipart form data
        const formData = await request.formData();
        const locationName = formData.get("locationName") as string;
        const latitude = parseFloat(formData.get("latitude") as string);
        const longitude = parseFloat(formData.get("longitude") as string);
        const userNote = (formData.get("userNote") as string) || null;
        const photo = formData.get("photo") as File;

        // 表單驗證
        if (!locationName || !photo || isNaN(latitude) || isNaN(longitude)) {
            return data(
                { error: "請填寫必要欄位並上傳照片", success: false },
                { status: 400 }
            );
        }

        // 驗證檔案大小（最大 10MB）
        if (photo.size > 10 * 1024 * 1024) {
            return data(
                { error: "照片大小不能超過 10MB", success: false },
                { status: 400 }
            );
        }

        // 2. 生成唯一的檔案名稱
        const fileExtension = photo.name.split(".").pop() || "jpg";
        const photoKey = `trips/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${fileExtension}`;

        // 3. 讀取圖片的二進位資料
        const photoArrayBuffer = await photo.arrayBuffer();
        const photoUint8Array = new Uint8Array(photoArrayBuffer);

        // 4. 上傳圖片到 R2
        await context.cloudflare.env.BUCKET.put(photoKey, photoArrayBuffer, {
            httpMetadata: {
                contentType: photo.type,
            },
        });

        // 5. 呼叫 Workers AI 分析圖片氛圍
        // 使用 LLaVA（Large Language and Vision Assistant）模型
        // 這個模型可以「看懂」圖片並用文字描述它
        let aiVibe: string | null = null;

        try {
            const aiResponse = await context.cloudflare.env.AI.run(
                "@cf/llava-hf/llava-1.5-7b-hf" as any,
                {
                    image: Array.from(photoUint8Array),
                    prompt:
                        "Describe the atmosphere of this travel photo in Traditional Chinese (Taiwan), within 50 words. Focus on the vibe and scenery.",
                    max_tokens: 256,
                }
            );

            // 取得 AI 回傳的描述文字
            if (aiResponse && typeof aiResponse === "object" && "description" in aiResponse) {
                aiVibe = (aiResponse as any).description || null;
            } else if (aiResponse && typeof aiResponse === "object" && "response" in aiResponse) {
                aiVibe = (aiResponse as any).response || null;
            }
        } catch (aiError) {
            // AI 分析失敗不影響主流程，只記錄錯誤
            // 本地開發可能無法存取 Workers AI（需要 --remote 模式）
            console.warn("AI 氛圍分析失敗（本地開發模式可能不支援）:", aiError);
            aiVibe = null;
        }

        // 6. 寫入 D1 資料庫
        const db = getDb(context.cloudflare.env.DB);
        await db.insert(trips).values({
            locationName,
            latitude,
            longitude,
            photoKey,
            userNote,
            aiVibe,
        });

        return data({ success: true, error: null });
    } catch (error) {
        console.error("新增打卡失敗:", error);
        return data(
            {
                error: `上傳失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
                success: false,
            },
            { status: 500 }
        );
    }
}
