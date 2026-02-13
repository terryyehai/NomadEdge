/**
 * TripMap 地圖元件（純客戶端）
 *
 * 這個檔案用 .client.tsx 後綴，告訴 React Router：
 * 「這個元件只在瀏覽器中執行，不要在伺服器端渲染它。」
 *
 * 為什麼需要這樣做？
 * Leaflet 地圖庫需要瀏覽器的 window 和 document 物件才能工作，
 * 但伺服器端（Cloudflare Worker）沒有這些東西。
 * 所以我們告訴框架：「等到使用者的瀏覽器打開後再載入地圖。」
 */

import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Trip } from "~/db/schema";

// ===== 修正 Leaflet 預設圖示問題 =====
// Leaflet 的預設 marker 圖示在打包工具（如 Vite）中會找不到路徑，
// 這裡手動指定使用 CDN 上的圖示檔案。
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ===== 自訂的打卡點圖示（帶有旅遊感的暖色） =====
const tripIcon = L.divIcon({
    className: "trip-marker",
    html: `<div class="trip-marker-inner">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

// ===== 地圖點擊事件處理元件 =====
// React-Leaflet 使用「子元件」的方式來綁定事件
// 這個元件不渲染任何東西，只負責監聽地圖點擊事件
interface MapClickHandlerProps {
    onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null; // 不渲染任何 UI
}

// ===== R2 圖片 URL 生成 =====
// 本地開發時，圖片透過 API 路由代理（Phase 3 實作）
function getPhotoUrl(photoKey: string): string {
    return `/api/photos/${photoKey}`;
}

// ===== 主要地圖元件 =====
interface TripMapProps {
    /** 所有打卡紀錄 */
    trips: Trip[];
    /** 點擊地圖空白處的回調函式 */
    onMapClick?: (lat: number, lng: number) => void;
}

export default function TripMap({ trips, onMapClick }: TripMapProps) {
    const [isClient, setIsClient] = useState(false);

    // 確保只在客戶端渲染
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-gray-900">
                <div className="text-gray-400 text-lg">🗺️ 載入地圖中...</div>
            </div>
        );
    }

    return (
        <MapContainer
            center={[25.034, 121.564]} // 預設中心：台北 101
            zoom={13}
            className="w-full h-full"
            zoomControl={true}
        >
            {/* OpenStreetMap 地圖圖層 —— 免費且開源的地圖底圖 */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 監聽地圖點擊事件 */}
            {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

            {/* 渲染所有打卡點 Marker */}
            {trips.map((trip) => (
                <Marker
                    key={trip.id}
                    position={[trip.latitude, trip.longitude]}
                    icon={tripIcon}
                >
                    {/* 點擊 Marker 後彈出的回憶卡片 */}
                    <Popup className="trip-popup" maxWidth={320} minWidth={280}>
                        <div className="trip-card">
                            {/* 照片區域 */}
                            <div className="trip-card-photo">
                                <img
                                    src={getPhotoUrl(trip.photoKey)}
                                    alt={trip.locationName}
                                    className="w-full h-40 object-cover rounded-lg"
                                    loading="lazy"
                                />
                            </div>

                            {/* 地點名稱 */}
                            <h3 className="trip-card-title">{trip.locationName}</h3>

                            {/* AI 氛圍描述 */}
                            {trip.aiVibe && (
                                <div className="trip-card-vibe">
                                    <span className="trip-card-vibe-label">✨ AI 氛圍感知</span>
                                    <p className="trip-card-vibe-text">{trip.aiVibe}</p>
                                </div>
                            )}

                            {/* 使用者筆記 */}
                            {trip.userNote && (
                                <div className="trip-card-note">
                                    <span className="trip-card-note-label">📝 旅行筆記</span>
                                    <p className="trip-card-note-text">{trip.userNote}</p>
                                </div>
                            )}

                            {/* 打卡時間 */}
                            <div className="trip-card-time">
                                🕐{" "}
                                {trip.createdAt
                                    ? new Date(trip.createdAt).toLocaleDateString("zh-TW", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "未知時間"}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
