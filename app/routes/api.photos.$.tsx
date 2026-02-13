/**
 * 照片代理 API 路由
 *
 * R2 儲存桶中的照片預設不是公開的，
 * 所以我們需要一個 API 路由來「代理」讀取照片。
 *
 * 當前端 <img src="/api/photos/trips/xxx.jpg"> 時，
 * 這個路由會從 R2 讀取對應的檔案並回傳給瀏覽器。
 *
 * 就像一個「轉接頭」：
 * 瀏覽器 → 這個路由 → R2 → 回傳圖片
 */

import type { Route } from "./+types/api.photos.$";

// ===== Loader：處理 GET 請求 =====
export async function loader({ params, context }: Route.LoaderArgs) {
    try {
        // 從 URL 中取得照片的 key（路徑）
        // 例如 /api/photos/trips/123-abc.jpg → key = "trips/123-abc.jpg"
        const photoKey = params["*"];

        if (!photoKey) {
            return new Response("找不到照片路徑", { status: 400 });
        }

        // 從 R2 讀取照片
        const object = await context.cloudflare.env.BUCKET.get(photoKey);

        if (!object) {
            return new Response("照片不存在", { status: 404 });
        }

        // 回傳照片（設定正確的 Content-Type 和快取標頭）
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new Response(object.body, {
            headers,
        });
    } catch (error) {
        console.error("讀取照片失敗:", error);
        return new Response("讀取照片失敗", { status: 500 });
    }
}
