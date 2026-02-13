# 🧭 Project NomadEdge 專案交付報告

**NomadEdge（邊緣旅人）** 是一個基於 Cloudflare 全端生態系的互動式旅遊地圖應用。我們使用 React Router v7、Drizzle ORM、D1 資料庫、R2 儲存桶和 Workers AI，打造了一個現代化、高效能且具有 AI 感知能力的 Web 應用。

## ✨ 核心功能完成度

### ✅ 1. 互動式世界地圖
- **滿版地圖介面**：使用 Leaflet.js 提供流暢的地圖體驗。
- **SSR 相容性**：透過 `ClientOnly` 架構解決了 Remix/SSR 常見的 "window is not defined" 問題。
- **自訂 Marker 與 Popup**：設計了帶有旅遊感的標記，點擊後會彈出精美的回憶卡片。

### ✅ 2. 旅遊回憶記錄
- **新增打卡 Modal**：點擊地圖任意處即可觸發，自動帶入經緯度。
- **圖片上傳與預覽**：支援拖放上傳，即時預覽照片。
- **資料儲存**：照片存入 R2 Object Storage，打卡資訊存入 D1 SQL Database。

### ✅ 3. AI 氛圍感知
- **整合 Workers AI**：使用 `@cf/llava-hf/llava-1.5-7b-hf` 多模態模型。
- **自動描述**：上傳照片時，AI 會自動分析畫面內容，生成一段繁體中文的「氛圍描述」。
- **優雅降級**：即使 AI 服務暫時無法存取，打卡功能仍可正常運作。

### ✅ 4. 現代化 UI 設計
- **Tailwind CSS v4**：使用最新版 Utility-first CSS 框架。
- **Glassmorphism**：介面大量採用毛玻璃效果，提升質感。
- **深色模式**：預設採用深色主題，符合現代開發者與使用者喜好。

---

## 🛠️ 技術架構總覽

| 層級 | 技術選型 | 用途 |
|------|---------|------|
| **Frontend** | React Router v7 | 路由管理、Loader/Action 資料流（取代 Remix） |
| **Styling** | Tailwind CSS v4 | 極速開發、現代化設計系統 |
| **Map** | React Leaflet | 地圖呈現與互動 |
| **Database** | Cloudflare D1 | 邊緣 SQLite 資料庫（存地理資訊、文字） |
| **Storage** | Cloudflare R2 | S3 相容物件儲存（存照片） |
| **AI** | Workers AI | 執行 LLaVA 模型進行影像識別 |
| **ORM** | Drizzle ORM | 型別安全的資料庫操作 |

---

## 🚀 如何啟動專案

### 前置需求
1. **Node.js**: v20+
2. **Cloudflare 帳號**: 需要啟用 Workers、D1、R2 Access
3. **Wrangler CLI**: `npm install -g wrangler`

### 步驟 1：安裝依賴
```bash
npm install
```

### 步驟 2：登入 Cloudflare
```bash
npx wrangler login
```

### 步驟 3：建立本地資料庫
這會根據 Drizzle 的遷移檔建立 SQLite 資料表：
```bash
npx wrangler d1 migrations apply nomad-edge-db --local
```

### 步驟 4：啟動開發伺服器
```bash
npm run dev
```
打開瀏覽器訪問 `http://localhost:5173` 即可看到地圖！

---

## 🚢 如何部署上線

只需要一個指令，Wrangler 會處理所有事情（包含上傳靜態資源、部署 Worker、綁定資料庫）：

```bash
npm run deploy
```

> **注意**：首次部署後，記得在 Cloudflare Dashboard 中對 **生產環境資料庫** 執行 Migration：
> `npx wrangler d1 migrations apply nomad-edge-db --remote`

---

## 📂 檔案結構導覽

- `app/routes/home.tsx`: 首頁（地圖顯示、資料載入）
- `app/routes/trips.new.tsx`: 打卡 API（處理上傳 + AI 分析）
- `app/components/Map.client.tsx`: 地圖元件（純客戶端）
- `app/db/schema.ts`: 資料庫結構定義
- `wrangler.jsonc`: Cloudflare 服務綁定設定

---

## 🔧 常見問題排除 (Troubleshooting)

### Cloudflare Pages 部署失敗 (Build Failure)
如果在部署時遇到 `wrangler types` 或 `cf-typegen` 相關錯誤，可能是因為自動生成型別定義的腳本在 CI 環境中卡住。

**解決方案：**
我們已經移除了 `package.json` 中的 `postinstall` 腳本，這應該能解決大部分問題。如果仍然遇到問題：

1. **手動設定環境變數**：在 Cloudflare Dashboard > Settings > Environment Variables 中，確保設定 `NODE_VERSION: 20`（或更高）。
2. **清除快取部署**：在 Cloudflare Pages 部署頁面選擇 "Retry deployment" > "Clear cache and deploy"。
