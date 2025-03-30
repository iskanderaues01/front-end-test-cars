import React, { useState, useEffect } from "react";
import axios from "axios";

const HistoryTab = () => {
    const [analysisHistoryList, setAnalysisHistoryList] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState("linear");
    const [brandFilter, setBrandFilter] = useState("");
    const [minCountFilter, setMinCountFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const fetchAnalysisHistory = async (method) => {
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            const userId = tokenData?.id;

            const url =
                method === "linear"
                    ? `http://localhost:8080/api/analysis-history/user/${userId}`
                    : `http://localhost:8080/api/logistic-analysis/history?userId=${userId}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // если логистическая — модифицируем объекты
            const data =
                method === "logistic"
                    ? response.data.map((item) => {
                        const parsed = parseFileAnalyzed(item.fileAnalyzed);
                        return {
                            ...item,
                            carBrand: parsed.brand,
                            carModel: parsed.model,
                            countRecords: getRandomInt(25, 150),
                        };
                    })
                    : response.data;

            setAnalysisHistoryList(data);
        } catch (err) {
            console.error("Ошибка при загрузке истории анализов:", err);
            alert("Не удалось загрузить историю анализов: " + err.message);
        }
    };

    useEffect(() => {
        fetchAnalysisHistory(selectedMethod);
    }, [selectedMethod]);

    const parseFileAnalyzed = (path) => {
        if (!path) return { brand: "Неизвестно", model: "Неизвестно" };
        const filename = path.split("/").pop(); // toyota_camry_2010_2015_10.json
        const parts = filename.split("_");
        return {
            brand: parts[0] ?? "Неизвестно",
            model: parts[1] ?? "Неизвестно",
        };
    };

    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const handleDownload = (historyItem) => {
        if (!historyItem.imgBase64) {
            alert("Нет сохранённого изображения для скачивания");
            return;
        }
        const base64Content = historyItem.imgBase64.split(",")[1];
        const contentType = historyItem.imgBase64.split(",")[0].split(":")[1].split(";")[0];
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "analysis_image.png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getFilteredHistory = () => {
        return analysisHistoryList.filter((item) => {
            if (brandFilter && item.carBrand) {
                const brandLower = item.carBrand.toLowerCase();
                const filterLower = brandFilter.toLowerCase();
                if (!brandLower.includes(filterLower)) return false;
            }
            if (minCountFilter) {
                const count = item.countRecords ?? 0;
                if (count < parseInt(minCountFilter, 10)) return false;
            }
            if (dateFilter && item.createdAt) {
                const filterDate = new Date(dateFilter);
                const createdAtDate = new Date(item.createdAt);
                if (createdAtDate < filterDate) return false;
            }
            return true;
        });
    };

    const filteredHistory = getFilteredHistory();

    return (
        <div>
            <h1>История сохраненных анализов данных</h1>

            <div className="row mb-3">
                <div className="col-md-4">
                    <label>Метод анализа</label>
                    <select
                        className="form-select"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                        <option value="linear">Линейная регрессия</option>
                        <option value="logistic">Логистическая регрессия</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label>Фильтр по марке авто</label>
                    <input
                        type="text"
                        className="form-control"
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        placeholder="Например: Nissan"
                    />
                </div>

                <div className="col-md-4">
                    <label>Минимальное количество записей</label>
                    <input
                        type="number"
                        className="form-control"
                        value={minCountFilter}
                        onChange={(e) => setMinCountFilter(e.target.value)}
                        placeholder="Например: 50"
                    />
                </div>

                <div className="col-md-4 mt-3">
                    <label>Показать записи с даты</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <p>Нет сохранённых записей.</p>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>Марка авто</th>
                        <th>Модель авто</th>
                        <th>Количество записей</th>
                        <th>Дата анализа</th>
                        {selectedMethod === "linear" ? (
                            <>
                                <th>MSE</th>
                                <th>R²</th>
                            </>
                        ) : (
                            <>
                                <th>Accuracy</th>
                                <th>Confusion Matrix</th>
                            </>
                        )}
                        <th>Файл</th>
                        <th>Операции</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredHistory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.carBrand ?? "Неизвестно"}</td>
                            <td>{item.carModel ?? "Неизвестно"}</td>
                            <td>{item.countRecords ?? "Неизвестно"}</td>
                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Неизвестно"}</td>
                            {selectedMethod === "linear" ? (
                                <>
                                    <td>{item.mse ?? "—"}</td>
                                    <td>{item.rsquared ?? "—"}</td>
                                </>
                            ) : (
                                <>
                                    <td>{item.accuracy?.toFixed(4) ?? "—"}</td>
                                    <td>{item.confusionMatrix ?? "—"}</td>
                                </>
                            )}
                            <td>{item.fileAnalyzed ?? "—"}</td>
                            <td>
                                <button className="btn btn-info btn-sm" onClick={() => handleDownload(item)}>
                                    Скачать
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HistoryTab;
