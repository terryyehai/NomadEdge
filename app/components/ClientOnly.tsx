/**
 * ClientOnly 高階元件
 *
 * 這個元件確保包裹的內容只在瀏覽器（客戶端）中渲染。
 * 在伺服器端渲染（SSR）時，它只顯示一個 fallback（佔位內容）。
 *
 * 為什麼需要它？
 * Leaflet 地圖庫需要瀏覽器的 window 物件，
 * 但 Cloudflare Worker 伺服器沒有 window。
 * 如果在伺服器上載入 Leaflet，會報錯 "window is not defined"。
 */

import { useState, useEffect, type ReactNode } from "react";

interface ClientOnlyProps {
    children: () => ReactNode;
    fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // useEffect 只在客戶端執行，所以這裡設 true 就表示我們在瀏覽器中
        setIsClient(true);
    }, []);

    // 伺服器端：顯示 fallback
    // 客戶端：顯示實際內容
    return isClient ? <>{children()}</> : <>{fallback}</>;
}
