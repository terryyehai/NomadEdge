import { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export function LocationButton() {
    const map = useMap();
    const [loading, setLoading] = useState(false);
    // 儲存目前位置的 Marker 參照，以便移除更新
    const [currentLocationMarker, setCurrentLocationMarker] = useState<L.Marker | null>(null);

    const handleLocationClick = () => {
        setLoading(true);

        if (!navigator.geolocation) {
            alert("您的瀏覽器不支援地理定位功能。");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // 移除舊的 Marker (如果有的話)
                if (currentLocationMarker) {
                    currentLocationMarker.remove();
                }

                // 飛到目前位置
                map.flyTo([latitude, longitude], 15, {
                    duration: 1.5,
                });

                // 建立一個藍色圓點標記表示「目前位置」
                // 使用 Leaflet 預設 DivIcon 來繪製一個簡單的藍色圓點
                const locationIcon = L.divIcon({
                    className: "current-location-marker",
                    html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg pulse-animation"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                });

                const newMarker = L.marker([latitude, longitude], { icon: locationIcon })
                    .addTo(map)
                    .bindPopup("您目前的位置")
                    .openPopup();

                setCurrentLocationMarker(newMarker);
                setLoading(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                let errorMessage = "無法取得您的位置。";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "您已拒絕提供位置權限。請在瀏覽器設定中允許取用位置。";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "無法偵測到您的位置資訊。";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "取得位置逾時，請稍後再試。";
                        break;
                }
                alert(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: true, // 要求高精確度
                timeout: 10000,          // 10秒逾時
                maximumAge: 0            // 不使用快取
            }
        );
    };

    return (
        <button
            onClick={handleLocationClick}
            disabled={loading}
            className="leaflet-bar leaflet-control custom-location-btn"
            title="定位到目前位置"
            style={{
                position: 'absolute',
                bottom: '80px', // 調整位置，避免被其他控制項擋住 (e.g. 縮放控制項通常在左上或右下，這裡假設放右下)
                right: '10px',
                zIndex: 1000,
                backgroundColor: 'var(--color-surface-card, #1e293b)',
                border: '1px solid var(--color-glass-border, rgba(148, 163, 184, 0.15))',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
            }}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
            )}
        </button>
    );
}

// 為了讓樣式更完整，我們可以把這段 CSS 加到全域 CSS 或這裡的 style tag
// 這裡簡單使用 style tag 注入 pulse animation
const style = document.createElement('style');
style.innerHTML = `
  .pulse-animation {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    animation: pulse-blue 2s infinite;
  }
  @keyframes pulse-blue {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
  .custom-location-btn:hover {
      background-color: var(--color-surface-light, #334155) !important;
      transform: scale(1.05);
  }
`;
if (typeof document !== 'undefined') {
    document.head.appendChild(style);
}
