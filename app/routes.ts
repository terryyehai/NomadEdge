/**
 * 路由設定
 *
 * 這裡定義了應用程式的所有路由（頁面地址對應的檔案）。
 * React Router v7 使用這份設定來決定：
 * 「當使用者訪問某個 URL 時，應該載入哪個檔案。」
 */

import {
    type RouteConfig,
    index,
    route,
} from "@react-router/dev/routes";

export default [
    // 首頁 —— 顯示地圖和所有打卡點
    index("routes/home.tsx"),

    // 新增打卡 API —— 處理表單提交（純後端，無 UI）
    route("trips/new", "routes/trips.new.tsx"),

    // 照片代理 API —— 從 R2 讀取並回傳照片
    // $ 是萬用字元，匹配 /api/photos/ 後面的任意路徑
    route("api/photos/*", "routes/api.photos.$.tsx"),
] satisfies RouteConfig;
