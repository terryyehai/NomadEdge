/**
 * 新增打卡 Modal 元件
 *
 * 當使用者點擊地圖上的任意位置時，會彈出這個 Modal。
 * 使用者可以在這裡填寫：
 * - 地點名稱
 * - 上傳一張照片
 * - 寫一段旅行心得
 *
 * 表單提交後，資料會被送到 /trips/new 路由處理（multipart/form-data）。
 */

import { useState, useRef, type FormEvent } from "react";
import { useFetcher } from "react-router";

interface AddTripModalProps {
    /** 使用者點擊地圖時選定的緯度 */
    lat: number;
    /** 使用者點擊地圖時選定的經度 */
    lng: number;
    /** 關閉 Modal 的回調函式 */
    onClose: () => void;
    /** 新增成功後的回調函式 */
    onSuccess?: () => void;
}

export default function AddTripModal({
    lat,
    lng,
    onClose,
    onSuccess,
}: AddTripModalProps) {
    // useFetcher 讓我們可以在不重新整理頁面的情況下提交表單
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state !== "idle";

    // 圖片預覽
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 當使用者選擇檔案時，生成預覽圖片
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 點擊圖片上傳區域時，觸發隱藏的 file input
    const handleUploadAreaClick = () => {
        fileInputRef.current?.click();
    };

    // 如果提交成功（fetcher 回傳了資料且沒有錯誤），關閉 Modal
    if (fetcher.data && !fetcher.data?.error) {
        onSuccess?.();
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-add-trip" onClick={(e) => e.stopPropagation()}>
                {/* Modal 標題 */}
                <div className="modal-header">
                    <h2 className="modal-title">📍 新增打卡點</h2>
                    <button className="modal-x-btn" onClick={onClose} aria-label="關閉">
                        ✕
                    </button>
                </div>

                {/* 座標顯示 */}
                <p className="modal-coords">
                    📌 緯度: {lat.toFixed(6)}, 經度: {lng.toFixed(6)}
                </p>

                {/* 表單 */}
                <fetcher.Form
                    method="post"
                    action="/trips/new"
                    encType="multipart/form-data"
                >
                    {/* 隱藏的座標欄位 */}
                    <input type="hidden" name="latitude" value={lat} />
                    <input type="hidden" name="longitude" value={lng} />

                    {/* 地點名稱 */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="locationName">
                            🏷️ 地點名稱
                        </label>
                        <input
                            type="text"
                            id="locationName"
                            name="locationName"
                            className="form-input"
                            placeholder="例如：東京鐵塔、九份老街"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 圖片上傳區域 */}
                    <div className="form-group">
                        <label className="form-label">📷 旅遊照片</label>
                        <div
                            className={`upload-area ${preview ? "has-preview" : ""}`}
                            onClick={handleUploadAreaClick}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="預覽"
                                    className="upload-preview"
                                />
                            ) : (
                                <div className="upload-placeholder">
                                    <span className="upload-icon">📸</span>
                                    <span className="upload-text">
                                        點擊此處上傳照片
                                    </span>
                                    <span className="upload-hint">
                                        支援 JPG、PNG（最大 10MB）
                                    </span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="photo"
                                accept="image/*"
                                className="upload-input"
                                onChange={handleFileChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* 旅行心得 */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="userNote">
                            📝 旅行心得（選填）
                        </label>
                        <textarea
                            id="userNote"
                            name="userNote"
                            className="form-textarea"
                            placeholder="記錄這次旅行的感受..."
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 錯誤訊息 */}
                    {fetcher.data?.error && (
                        <div className="form-error">
                            ❌ {fetcher.data.error}
                        </div>
                    )}

                    {/* 提交按鈕 */}
                    <button
                        type="submit"
                        className="form-submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="btn-spinner" />
                                上傳中...AI 正在感知氛圍 ✨
                            </>
                        ) : (
                            "🚀 打卡！"
                        )}
                    </button>
                </fetcher.Form>
            </div>
        </div>
    );
}
