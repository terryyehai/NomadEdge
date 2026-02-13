import { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * 定位按鈕組件
 * 
 * 透過瀏覽器 Geolocation API 取得使用者經緯度，
 * 並將地圖飛向 (flyTo) 該座標。
 */
export function LocationButton() {
    const map = useMap();
    const [loading, setLoading] = useState(false);
    const [currentLocationMarker, setCurrentLocationMarker] = useState<L.Marker | null>(null);

    const handleLocationClick = () => {
        if (loading) return;
        setLoading(true);

        if (!navigator.geolocation) {
            alert("您的瀏覽器不支援地理定位功能。");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (currentLocationMarker) {
                    currentLocationMarker.remove();
                }

                map.flyTo([latitude, longitude], 15, {
                    duration: 1.5,
                });

                // 使用在 app.css 中定義的 class
                const locationIcon = L.divIcon({
                    className: "current-location-marker",
                    html: `<div class="current-location-marker-inner"></div>`,
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
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <button
            onClick={handleLocationClick}
            disabled={loading}
            className="custom-location-btn"
            title="定位到目前位置"
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
                "🎯"
            )}
        </button>
    );
}
