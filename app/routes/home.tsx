/**
 * 首頁路由 — NomadEdge 的主畫面
 *
 * 這是使用者打開應用後看到的第一個頁面。
 * 它做了兩件事：
 * 1. Loader：從 D1 資料庫讀取所有打卡紀錄
 * 2. Component：渲染一個滿版地圖，上面顯示所有打卡點
 */

import { useState, useEffect, type ComponentType } from "react";
import type { Route } from "./+types/home";
import { getDb } from "~/db";
import { trips } from "~/db/schema";
import { desc } from "drizzle-orm";
import AddTripModal from "~/components/AddTripModal";
import type { Trip } from "~/db/schema";

// ===== 地圖元件的 Props 型別 =====
interface TripMapProps {
  trips: Trip[];
  onMapClick?: (lat: number, lng: number) => void;
}

// ===== 1. Loader：從 D1 資料庫讀取資料 =====
export async function loader({ context }: Route.LoaderArgs) {
  try {
    const db = getDb(context.cloudflare.env.DB);
    const allTrips = await db
      .select()
      .from(trips)
      .orderBy(desc(trips.createdAt));

    return { trips: allTrips };
  } catch (error) {
    console.error("載入打卡紀錄失敗:", error);
    return { trips: [] };
  }
}

// ===== 2. Meta =====
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NomadEdge 邊緣旅人 — 你的旅行地圖" },
    {
      name: "description",
      content: "在地圖上記錄每一次旅行，AI 幫你描述每張照片的氛圍。",
    },
  ];
}

// ===== 3. 主要元件 =====
export default function Home({ loaderData }: Route.ComponentProps) {
  const { trips: tripData } = loaderData;

  // 動態載入地圖元件（避免 SSR 問題）
  const [MapComponent, setMapComponent] = useState<ComponentType<TripMapProps> | null>(null);

  useEffect(() => {
    // 只在客戶端動態 import 地圖元件
    import("~/components/Map.client").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  // 儲存使用者點擊地圖的座標
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="app-container">
      {/* 頂部導航列 */}
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-logo">
            <span className="app-logo-icon">🧭</span>
            <span className="app-logo-text">NomadEdge</span>
            <span className="app-logo-sub">邊緣旅人</span>
          </h1>
          <div className="app-stats">
            <span className="app-stats-count">{tripData.length}</span>
            <span className="app-stats-label">個打卡點</span>
          </div>
        </div>
      </header>

      {/* 滿版地圖區域 */}
      <main className="app-map">
        {MapComponent ? (
          <MapComponent trips={tripData} onMapClick={handleMapClick} />
        ) : (
          <div className="map-loading">
            <div className="map-loading-spinner" />
            <p>🗺️ 載入地圖中...</p>
          </div>
        )}
      </main>

      {/* 地圖操作提示 */}
      {!showAddModal && (
        <div className="app-hint">
          <span>👆 點擊地圖任意處即可新增打卡點</span>
        </div>
      )}

      {/* 新增打卡 Modal */}
      {showAddModal && selectedPosition && (
        <AddTripModal
          lat={selectedPosition.lat}
          lng={selectedPosition.lng}
          onClose={() => {
            setShowAddModal(false);
            setSelectedPosition(null);
          }}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}
