# 📘 LEARN.md — NomadEdge 邊緣旅人 學習筆記

> 這份文件用「白話文」解釋整個 NomadEdge 專案的技術架構，
> 讓你即使不懂程式也能理解每個部分在做什麼。

---

## 🧩 這個專案到底是什麼？

**NomadEdge（邊緣旅人）** 是一個旅遊地圖打卡應用。

想像你有一張巨大的世界地圖，每去一個地方，你就在地圖上插一根小旗子，
旁邊貼一張照片，寫一段心得。然後有個 AI 助手會幫你用詩意的語言描述照片的氛圍。

**這就是 NomadEdge 做的事。** 只不過這張地圖在你的瀏覽器裡。

---

## 🏗️ 技術架構（用比喻解釋）

想像你開了一家「旅行記憶商店」：

| 角色 | 真實世界比喻 | 技術名稱 |
|------|-------------|---------|
| **店面** | 顧客看到的漂亮店面 | React + Tailwind CSS |
| **地圖桌** | 店裡那張大地圖 | React Leaflet |
| **收銀台** | 處理訂單的後台 | React Router v7 (Loader/Action) |
| **倉庫** | 存放照片的儲藏室 | Cloudflare R2 |
| **帳本** | 記錄所有打卡紀錄 | Cloudflare D1 (SQLite) |
| **AI 店員** | 看照片描述氛圍的員工 | Workers AI (LLaVA) |
| **搬運工** | 幫你管理帳本格式 | Drizzle ORM |
| **房東** | 提供整棟大樓的人 | Cloudflare |

---

## 📂 程式碼怎麼組織的？

```
nomad-edge/
├── app/                        ← 🏠 主要程式碼都在這裡
│   ├── components/             ← 🧱 可重複使用的元件
│   │   ├── AddTripModal.tsx    ← 新增打卡的彈出視窗
│   │   ├── ClientOnly.tsx      ← 確保地圖只在瀏覽器渲染的工具
│   │   └── Map.client.tsx      ← 地圖元件（只在瀏覽器執行）
│   ├── db/                     ← 💾 資料庫相關
│   │   ├── schema.ts           ← 資料表的「藍圖」（定義有哪些欄位）
│   │   └── index.ts            ← 資料庫連線的「轉接頭」
│   ├── routes/                 ← 🛣️ 頁面路由（URL 對應的功能）
│   │   ├── home.tsx            ← 首頁（地圖 + 打卡點）
│   │   ├── trips.new.tsx       ← 處理「新增打卡」的後台（上傳 R2 + AI + 寫 D1）
│   │   └── api.photos.$.tsx    ← 照片代理（讓瀏覽器能讀到 R2 的照片）
│   ├── routes.ts               ← 路由設定（告訴框架每個 URL 對應哪個檔案）
│   ├── root.tsx                ← 整個 App 的外框（HTML 骨架）
│   └── app.css                 ← 所有的視覺樣式
├── drizzle/                    ← 📋 資料庫遷移檔
│   └── migrations/
│       └── 0000_*.sql          ← 建立 trips 資料表的 SQL
├── workers/
│   └── app.ts                  ← Cloudflare Worker 入口
├── wrangler.jsonc              ← ⚙️ Cloudflare 服務設定（D1、R2、AI 綁定）
├── drizzle.config.ts           ← Drizzle ORM 設定
└── vite.config.ts              ← Vite 建置工具設定
```

---

## 🔑 關鍵技術決策

### 1. 為什麼用 React Router v7 而不是 Remix？

**故事：** 原本我們計畫用 Remix，但在研究時發現 Remix 的創始人已經宣布：
「新專案請用 React Router v7，我們不再建議用 Remix 了。」

**比喻：** 就像 iPhone 出了新一代，舊的還能用，但蘋果不再更新了。
React Router v7 就是那個「新一代」，API 幾乎一樣，但有更好的維護。

### 2. 為什麼地圖元件的檔名是 `.client.tsx`？

**問題：** Leaflet 地圖需要 `window` 物件（瀏覽器才有的東西），
但我們的伺服器（Cloudflare Worker）沒有 `window`。

**解法：** 我們用兩招避開這個問題：
1. `ClientOnly.tsx` — 一個「門衛」元件，只讓內容在瀏覽器中顯示
2. `useEffect` + `dynamic import()` — 等瀏覽器準備好後才載入地圖

**比喻：** 這就像你不能在沒有水的地方游泳一樣。
我們確保「先把水放好，再跳進去游」。

### 3. 為什麼照片需要一個「代理路由」？

**問題：** R2 儲存桶裡的照片預設是「私密」的，瀏覽器無法直接存取。

**解法：** 我們建立了一個 API 路由（`api.photos.$`）作為「中間人」：
- 瀏覽器說：「我要看這張照片」
- API 路由去 R2 拿照片
- 拿到後轉交給瀏覽器

**好處：** 安全（照片不會被隨便存取）+ 可以加快取（Cache）。

### 4. Workers AI 失敗怎麼辦？

**設計：** AI 分析用 `try-catch` 包起來。即使 AI 掛了，
打卡功能照樣能用，只是不會有氛圍描述。

**比喻：** 就像餐廳的甜點壞了，但主菜還是能正常上。
你還是能吃到飯，只是少了甜點。

---

## 🚀 如何在本地開發

```bash
# 1. 安裝依賴
cd d:\Antigravity\Cloudflare Pages\nomad-edge
npm install

# 2. 套用資料庫遷移（建立資料表）
npx wrangler d1 migrations apply nomad-edge-db --local

# 3. 啟動開發伺服器
npm run dev

# 4. 開啟瀏覽器
# 訪問 http://localhost:5173
```

### ⚠️ 本地開發注意事項

- **D1/R2 是模擬的**：本地的資料在重啟後可能遺失，這是正常的
- **AI 需要 --remote 模式**：Workers AI 只能在雲端執行，
  本地開發時 AI 氛圍描述功能不會啟用
- **Leaflet CSS**：如果地圖看起來怪怪的，確認 Leaflet CSS 有正確載入

---

## 🐛 我們遇到的坑（以及怎麼爬出來的）

### 坑 1：「window is not defined」
- **原因**：Leaflet 在伺服器端被載入，但伺服器沒有 `window`
- **解法**：用 `ClientOnly` 元件和動態 `import()` 確保只在客戶端載入

### 坑 2：wrangler.jsonc vs wrangler.toml
- **原因**：新版 Cloudflare 模板使用 `.jsonc`（JSON with Comments），不再用 `.toml`
- **解法**：跟著模板走，用 `.jsonc` 格式設定 D1/R2/AI 綁定

### 坑 3：Leaflet Marker 圖示消失
- **原因**：Vite 打包工具把 Leaflet 預設圖示的路徑搞亂了
- **解法**：手動指定 CDN 上的圖示 URL

### 坑 4：React.lazy() + .client.tsx 不合
- **原因**：`lazy()` 在 SSR 環境中尤其是 Cloudflare Worker 裡行為不如預期
- **解法**：改用 `useEffect` + `useState` + `dynamic import()` 的模式

---

## 🎓 從這個專案可以學到什麼

1. **Cloudflare 全端生態系**：D1（資料庫）、R2（儲存）、Workers AI（AI）
   三個服務如何在一個應用中協同工作
2. **SSR 的挑戰**：不是所有程式碼都能在伺服器和瀏覽器中都執行，
   學會辨識和處理「只能在瀏覽器執行」的程式碼
3. **React Router v7 的 Loader/Action 模式**：
   資料載入（Loader）和資料提交（Action）分離的架構
4. **Drizzle ORM**：用 TypeScript 定義資料庫結構，比寫原始 SQL 更安全
5. **AI 整合的最佳實踐**：AI 功能應該是「加分項」而非「必要項」，
   設計時要確保 AI 掛了不會影響核心功能

---

*最後更新：2026-02-12*
