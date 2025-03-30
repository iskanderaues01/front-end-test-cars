import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AnalysisTab = ({ analysisFile }) => {
    const [imageLoading, setImageLoading] = useState(false);
    const [carImage, setCarImage] = useState(null);
    const [analysisMethod, setAnalysisMethod] = useState("");
    const [analysisParam, setAnalysisParam] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [priceThreshold, setPriceThreshold] = useState("");

    const [futureYear, setFutureYear] = useState("");
    const [futureMileage, setFutureMileage] = useState("");
    const [futureEngineVolume, setFutureEngineVolume] = useState("");
    const [futureFuel, setFutureFuel] = useState("");
    const [futureTransmission, setFutureTransmission] = useState("");

    const [epochs, setEpochs] = useState("");
    const [batchSize, setBatchSize] = useState("");


    useEffect(() => {
        if (analysisFile) {
            fetchCarImage();
        }
    }, [analysisFile]);

    const fetchCarImage = async () => {
        try {
            setImageLoading(true);
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            const response = await axios.get("http://localhost:8080/api/cars/get-car-image", {
                params: { fileName: analysisFile.fileName },
                headers: { Authorization: `Bearer ${token}` },
            });
            setCarImage(response.data.imageUrl);
        } catch (err) {
            console.error("Ошибка при загрузке изображения:", err);
            setCarImage(null);
        } finally {
            setImageLoading(false);
        }
    };

    const handlePerformMachineLearning = async () => {
        if (!analysisFile) {
            alert("Сначала выберите файл во вкладке «Данные о машинах» (cars).");
            return;
        }
        if (!analysisParam) {
            alert("Выберите режим анализа машинного обучения.");
            return;
        }

        const tokenData = JSON.parse(localStorage.getItem("user"));
        const token = tokenData?.token;
        const userId = tokenData?.id;

        try {
            setAnalysisLoading(true);
            let response;

            if (analysisParam === "future_price") {
                if (!futureYear || !futureMileage || !futureEngineVolume || !futureFuel || !futureTransmission) {
                    alert("Заполните все параметры для прогноза цены.");
                    return;
                }

                response = await axios.get("http://localhost:8080/api/future-price-analysis", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        filename: analysisFile.fileName,
                        futureYear,
                        futureMileage,
                        futureEngineVolume,
                        futureFuel,
                        futureTransmission,
                        userId,
                        save: true,
                    },
                });
            } else if (analysisParam === "epoch_analysis") {
                if (!epochs || !batchSize) {
                    alert("Укажите количество эпох и размер батча.");
                    return;
                }

                response = await axios.get("http://localhost:8080/api/epochs-analysis", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        filename: analysisFile.fileName,
                        epochs,
                        batchSize,
                        userId,
                        save: true,
                    },
                });
            }

            setAnalysisResult(response.data);
        } catch (err) {
            console.error("Ошибка ML-анализа:", err);
            alert("Ошибка при выполнении ML-анализа: " + err.message);
        } finally {
            setAnalysisLoading(false);
        }
    };


    const handlePerformAnalysisLogic = async () => {
        if (!analysisFile) {
            alert("Сначала выберите файл во вкладке «Данные о машинах» (cars).");
            return;
        }
        if (!analysisMethod) {
            alert("Пожалуйста, выберите метод анализа из списка.");
            return;
        }

        const tokenData = JSON.parse(localStorage.getItem("user"));
        const token = tokenData?.token;
        const userId = tokenData?.id;

        try {
            setAnalysisLoading(true);
            let response;

            if (analysisMethod === "logistic_regression") {
                if (!priceThreshold) {
                    alert("Укажите порог цены для логистической регрессии.");
                    return;
                }
                response = await axios.get("http://localhost:8080/api/logistic-analysis/perform-logic", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        filename: analysisFile.fileName,
                        priceThreshold: priceThreshold,
                        userId: userId,
                        save: true,
                    },
                });
            } else if (analysisMethod === "linear_regression") {
                if (!analysisParam) {
                    alert("Для линейной регрессии выберите признак для анализа.");
                    return;
                }
                response = await axios.get("http://localhost:8080/api/perform-analysis", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        analysisType: analysisParam,
                        fileName: analysisFile.fileName,
                    },
                });
            } else if (analysisMethod === "machine_learning") {
                if (analysisParam === "future_price") {
                    response = await axios.get("http://localhost:8080/api/future-price-analysis", {
                        headers: { Authorization: `Bearer ${token}` },
                        params: {
                            filename: analysisFile.fileName,
                            futureYear,
                            futureMileage,
                            futureEngineVolume,
                            futureFuel,
                            futureTransmission,
                            userId,
                            save: true,
                        },
                    });
                } else if (analysisParam === "epoch_analysis") {
                    response = await axios.get("http://localhost:8080/api/epochs-analysis", {
                        headers: { Authorization: `Bearer ${token}` },
                        params: {
                            filename: analysisFile.fileName,
                            epochs,
                            batchSize,
                            userId,
                            save: true,
                        },
                    });
                }
            }

            setAnalysisResult(response.data);
        } catch (err) {
            alert("Ошибка при выполнении анализа: " + err.message);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handlePerformAnalysis = async () => {
        if (!analysisFile) {
            alert("Сначала выберите файл во вкладке «Данные о машинах» (cars).");
            return;
        }
        if (!analysisMethod) {
            alert("Пожалуйста, выберите метод анализа из списка.");
            return;
        }
        if (analysisMethod === "linear_regression" && !analysisParam) {
            alert("Для линейной регрессии нужно выбрать конкретный признак (год, пробег и т.д.).");
            return;
        }

        try {
            setAnalysisLoading(true);
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            let finalAnalysisType = analysisMethod;
            if (analysisMethod === "linear_regression" && analysisParam) {
                finalAnalysisType = analysisParam;
            }
            const response = await axios.get("http://localhost:8080/api/perform-analysis", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    analysisType: finalAnalysisType,
                    fileName: analysisFile.fileName,
                },
            });
            setAnalysisResult(response.data);
        } catch (err) {
            alert("Ошибка при выполнении анализа: " + err.message);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Результат анализа");
            let rowIndex = 1;

            // Общая информация
            worksheet.getCell(`A${rowIndex}`).value = "Сообщение:";
            worksheet.getCell(`B${rowIndex}`).value = analysisResult?.message || "";
            rowIndex++;

            // Вывод данных в зависимости от метода анализа
            if (analysisMethod === "linear_regression") {
                if (analysisResult?.FileAnalyzed) {
                    worksheet.getCell(`A${rowIndex}`).value = "Файл:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.FileAnalyzed;
                    rowIndex++;
                }
                if (analysisResult?.CarBrand || analysisResult?.CarModel) {
                    worksheet.getCell(`A${rowIndex}`).value = "Автомобиль:";
                    worksheet.getCell(`B${rowIndex}`).value = `${analysisResult.CarBrand ?? ""} ${analysisResult.CarModel ?? ""}`;
                    rowIndex++;
                }
                if (analysisResult?.CountRecords !== undefined) {
                    worksheet.getCell(`A${rowIndex}`).value = "Всего записей:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.CountRecords;
                    rowIndex++;
                }
                if (analysisResult?.MSE !== undefined) {
                    worksheet.getCell(`A${rowIndex}`).value = "MSE:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.MSE;
                    rowIndex++;
                }
                if (analysisResult?.["R^2"] !== undefined) {
                    worksheet.getCell(`A${rowIndex}`).value = "R²:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult["R^2"];
                    rowIndex++;
                }
                if (analysisResult?.Equation) {
                    worksheet.getCell(`A${rowIndex}`).value = "Уравнение:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.Equation;
                    rowIndex++;
                }
            } else if (analysisMethod === "logistic_regression") {
                if (analysisResult?.fileAnalyzed) {
                    worksheet.getCell(`A${rowIndex}`).value = "Файл анализа:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.fileAnalyzed;
                    rowIndex++;
                }
                if (analysisResult?.priceThreshold) {
                    worksheet.getCell(`A${rowIndex}`).value = "Порог цены:";
                    worksheet.getCell(`B${rowIndex}`).value = Number(analysisResult.priceThreshold).toLocaleString();
                    rowIndex++;
                }
                if (analysisResult?.accuracy !== undefined) {
                    worksheet.getCell(`A${rowIndex}`).value = "Точность (accuracy):";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.accuracy;
                    rowIndex++;
                }
                if (analysisResult?.confusionMatrix) {
                    worksheet.getCell(`A${rowIndex}`).value = "Матрица ошибок:";
                    worksheet.getCell(`B${rowIndex}`).value =
                        typeof analysisResult.confusionMatrix === "object"
                            ? JSON.stringify(analysisResult.confusionMatrix, null, 2)
                            : analysisResult.confusionMatrix;
                    rowIndex++;
                }
                if (analysisResult?.coefficients) {
                    worksheet.getCell(`A${rowIndex}`).value = "Коэффициенты:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.coefficients;
                    rowIndex++;
                }
                if (analysisResult?.intercept) {
                    worksheet.getCell(`A${rowIndex}`).value = "Перехват (intercept):";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.intercept;
                    rowIndex++;
                }
                if (analysisResult?.features) {
                    worksheet.getCell(`A${rowIndex}`).value = "Признаки:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.features;
                    rowIndex++;
                }
                if (analysisResult?.explanation) {
                    worksheet.getCell(`A${rowIndex}`).value = "Пояснение:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.explanation;
                    rowIndex++;
                }
            } else if (analysisMethod === "machine_learning") {
                if (analysisResult?.FileAnalyzed) {
                    worksheet.getCell(`A${rowIndex}`).value = "Файл анализа:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.FileAnalyzed;
                    rowIndex++;
                }
                if (analysisResult?.CarBrand || analysisResult?.CarModel) {
                    worksheet.getCell(`A${rowIndex}`).value = "Автомобиль:";
                    worksheet.getCell(`B${rowIndex}`).value = `${analysisResult.CarBrand ?? ""} ${analysisResult.CarModel ?? ""}`;
                    rowIndex++;
                }
                if (analysisResult?.CountRecords !== undefined) {
                    worksheet.getCell(`A${rowIndex}`).value = "Всего записей:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.CountRecords;
                    rowIndex++;
                }
                if (analysisResult?.FeatureImportance) {
                    worksheet.getCell(`A${rowIndex}`).value = "Важность признаков:";
                    const features = analysisResult.FeatureImportance;
                    const importanceText = Object.entries(features)
                        .map(([feat, imp]) => `${feat}: ${imp}`)
                        .join("\n");
                    worksheet.getCell(`B${rowIndex}`).value = importanceText;
                    worksheet.getCell(`B${rowIndex}`).alignment = { wrapText: true };
                    rowIndex++;
                }
            } else {
                // Общая информация для неизвестного метода
                if (analysisResult?.FileAnalyzed) {
                    worksheet.getCell(`A${rowIndex}`).value = "Файл анализа:";
                    worksheet.getCell(`B${rowIndex}`).value = analysisResult.FileAnalyzed;
                    rowIndex++;
                }
            }

            // Добавляем график, если он есть.
            // Если метод логистической регрессии, используем imgBase64, иначе PlotPath
            let imageData = null;

            if (analysisMethod === "logistic_regression" && analysisResult?.imgBase64) {
                imageData = analysisResult.imgBase64;
            } else if (analysisResult?.PlotPath) {
                imageData = analysisResult.PlotPath;
            }

            if (imageData) {
                let base64 = "";
                let extension = "png";

                if (imageData.startsWith("data:image/")) {
                    // формат: data:image/png;base64,...
                    base64 = imageData.split(",")[1];
                    extension = imageData.substring(11, imageData.indexOf(";"));
                } else {
                    // если просто base64 без префикса
                    base64 = imageData;
                }

                try {
                    const imageId = workbook.addImage({
                        base64,
                        extension
                    });

                    worksheet.addImage(imageId, {
                        tl: { col: 1, row: rowIndex },
                        br: { col: 5, row: rowIndex + 14 }
                    });
                    rowIndex += 16;
                } catch (err) {
                    console.warn("Не удалось добавить изображение:", err);
                }
            }


            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            saveAs(blob, "analysis_result.xlsx");
        } catch (err) {
            console.error("Ошибка экспорта в Excel:", err);
            alert("Не удалось экспортировать в Excel: " + err.message);
        }
    };


    const handleSaveToDb = async () => {
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            const userId = tokenData?.id;

            const requestBody = {
                message: analysisResult?.message ?? "",
                fileAnalyzed: analysisResult?.FileAnalyzed ?? "",
                countRecords: analysisResult?.CountRecords ?? 0,
                mse: analysisResult?.MSE ?? 0,
                rSquared: analysisResult?.["R^2"] ?? 0,
                equation: analysisResult?.Equation ?? "",
                imgBase64: analysisResult?.PlotPath ?? "",
                carBrand: analysisResult?.CarBrand ?? "",
                carModel: analysisResult?.CarModel ?? "",
                dummyFeatures: analysisResult?.DummyFeatures ? JSON.stringify(analysisResult.DummyFeatures) : null
            };

            await axios.post(`http://localhost:8080/api/analysis-history/save-leaner?userId=${userId}`, requestBody, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Успешно сохранено в БД");
        } catch (err) {
            console.error("Ошибка сохранения в БД:", err);
            alert("Не удалось сохранить в БД: " + err.message);
        }
    };

    const handleDownloadAnalyzedFile = async () => {
        const fileName =
            analysisFile?.fileName || analysisResult?.FileAnalyzed || analysisResult?.fileAnalyzed;

        if (!fileName) {
            alert("Имя файла для скачивания не найдено.");
            return;
        }

        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            const response = await axios.get(
                `http://localhost:8080/api/cars/download-car-info/${fileName}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const jsonData = response.data;

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                alert("Сервер вернул пустые данные или неправильный формат.");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("AnalyzedData");

            worksheet.columns = [
                { header: "Title", key: "Title", width: 25 },
                { header: "Price", key: "Price", width: 15 },
                { header: "Year", key: "Year", width: 10 },
                { header: "Link", key: "Link", width: 40 },
                { header: "ConditionBody", key: "ConditionBody", width: 20 },
                { header: "EngineVolume", key: "EngineVolume", width: 15 },
                { header: "Fuel", key: "Fuel", width: 10 },
                { header: "Transmission", key: "Transmission", width: 15 },
                { header: "Mileage", key: "Mileage", width: 12 },
                { header: "RawDescription", key: "RawDescription", width: 40 },
            ];

            jsonData.forEach((item) => {
                worksheet.addRow(item);
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const safeFileName = fileName.replace(".json", ".xlsx");
            saveAs(blob, safeFileName || "analyzed_data.xlsx");
        } catch (err) {
            console.error("Ошибка при скачивании/преобразовании:", err);
            alert("Не удалось скачать данные в Excel: " + err.message);
        }
    };


    return (
        <div>
            <h2>Анализ авто</h2>
            {analysisFile ? (
                <div>
                    <p><b>Название файла:</b> {analysisFile.fileName}</p>
                    <p><b>Марка:</b> {analysisFile.brand}</p>
                    <p><b>Модель:</b> {analysisFile.model}</p>
                    <p>
                        <b>От года:</b> {analysisFile.minYear}, <b>До года:</b> {analysisFile.maxYear}
                    </p>
                    {imageLoading ? (
                        <div className="text-center mt-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Загрузка...</span>
                            </div>
                        </div>
                    ) : carImage ? (
                        <img
                            src={carImage}
                            alt="Car Preview"
                            style={{maxWidth: "400px", display: "block", marginBottom: "10px"}}
                        />
                    ) : (
                        <p>(Изображение не загружено или отсутствует)</p>
                    )}
                    <p>Для начала анализа выберите метод анализа и параметры.</p>

                    {/* Выбор метода анализа */}
                    <div className="mb-3">
                        <label htmlFor="analysisMethod" style={{fontWeight: "bold"}}>
                            Метод анализа
                        </label>
                        <select
                            id="analysisMethod"
                            className="form-control"
                            value={analysisMethod}
                            onChange={(e) => {
                                setAnalysisMethod(e.target.value);
                                setAnalysisParam("");
                            }}
                        >
                            <option value="">-- Выберите метод анализа --</option>
                            <option value="linear_regression">Линейная регрессия</option>
                            <option value="logistic_regression">Логистическая регрессия</option>
                            <option value="machine_learning">Машинное обучение</option>
                        </select>
                        <small className="text-muted">
                            Например, выберите «Линейная регрессия», чтобы спрогнозировать цену.
                        </small>
                    </div>

                    {analysisMethod === "linear_regression" && (
                        <div className="mb-3">
                            <label htmlFor="analysisParam" style={{fontWeight: "bold"}}>
                                Признак (переменная)
                            </label>
                            <select
                                id="analysisParam"
                                className="form-control"
                                value={analysisParam}
                                onChange={(e) => setAnalysisParam(e.target.value)}
                            >
                                <option value="">-- Выберите признак --</option>
                                <option value="year">Год (year)</option>
                                <option value="mileage">Пробег (mileage)</option>
                                <option value="engine_volume">Объём двигателя (engine_volume)</option>
                                <option value="multiple_linear">
                                    Множественная регрессия (год + пробег + объём)
                                </option>
                                <option value="dummies">Множественная + категории (dummy)</option>
                            </select>
                            <small className="text-muted">
                                Выберите конкретный признак или «Множественная регрессия».
                            </small>
                        </div>
                    )}

                    {analysisMethod === "logistic_regression" && (
                        <div className="mb-3">
                            <label htmlFor="priceThreshold" style={{fontWeight: "bold"}}>
                                Порог цены
                            </label>
                            <input
                                id="priceThreshold"
                                type="number"
                                className="form-control"
                                value={priceThreshold}
                                onChange={(e) => setPriceThreshold(e.target.value)}
                                placeholder="Например: 10000000"
                            />
                            <small className="text-muted">
                                Укажите порог цены, выше которого авто считается дорогим.
                            </small>
                        </div>
                    )}

                    {analysisMethod === "machine_learning" && (
                        <div className="mb-3">
                            <label htmlFor="mlMode" style={{fontWeight: "bold"}}>Вид анализа ML</label>
                            <select
                                id="mlMode"
                                className="form-control"
                                value={analysisParam}
                                onChange={(e) => setAnalysisParam(e.target.value)}
                            >
                                <option value="">-- Выберите подтип анализа --</option>
                                <option value="future_price">Прогноз цены</option>
                                <option value="epoch_analysis">Обучение по эпохам</option>
                            </select>
                        </div>
                    )}

                    {analysisMethod === "machine_learning" && analysisParam === "future_price" && (
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <label>Год (futureYear)</label>
                                <input className="form-control" type="number"
                                       onChange={(e) => setFutureYear(e.target.value)} />
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Пробег</label>
                                <input className="form-control" type="number"
                                       onChange={(e) => setFutureMileage(e.target.value)} />
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Объём двигателя (в литрах)</label>
                                <input className="form-control" type="number" step="0.1" list="engineVolumeOptions"
                                       onChange={(e) => setFutureEngineVolume(e.target.value)} />
                                <datalist id="engineVolumeOptions">
                                    <option value="1.0" />
                                    <option value="1.2" />
                                    <option value="1.4" />
                                    <option value="1.6" />
                                    <option value="1.8" />
                                    <option value="2.0" />
                                    <option value="2.4" />
                                    <option value="3.0" />
                                </datalist>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Топливо</label>
                                <input className="form-control" type="text" list="fuelOptions"
                                       onChange={(e) => setFutureFuel(e.target.value)} />
                                <datalist id="fuelOptions">
                                    <option value="бензин" />
                                    <option value="дизель" />
                                    <option value="газ" />
                                    <option value="электро" />
                                    <option value="гибрид" />
                                </datalist>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Трансмиссия</label>
                                <input className="form-control" type="text" list="transmissionOptions"
                                       onChange={(e) => setFutureTransmission(e.target.value)} />
                                <datalist id="transmissionOptions">
                                    <option value="автомат" />
                                    <option value="механика" />
                                    <option value="вариатор" />
                                    <option value="робот" />
                                </datalist>
                            </div>
                        </div>
                    )}


                    {analysisMethod === "machine_learning" && analysisParam === "epoch_analysis" && (
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <label>Количество эпох</label>
                                <input className="form-control" type="number"
                                       onChange={(e) => setEpochs(e.target.value)}/>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label>Batch Size</label>
                                <input className="form-control" type="number"
                                       onChange={(e) => setBatchSize(e.target.value)}/>
                            </div>
                        </div>
                    )}

                    <div className="mb-3">
                        {analysisMethod === "logistic_regression" && (
                            <button className="btn btn-primary" onClick={handlePerformAnalysisLogic}>
                                Запустить логистическую регрессию
                            </button>
                        )}

                        {analysisMethod === "linear_regression" && (
                            <button className="btn btn-primary" onClick={handlePerformAnalysis}>
                                Запустить линейную регрессию
                            </button>
                        )}

                        {analysisMethod === "machine_learning" && (
                            <button
                                className="btn btn-primary"
                                onClick={handlePerformMachineLearning}
                                disabled={!analysisParam}
                            >
                                Запустить машинное обучение
                            </button>
                        )}

                        {analysisLoading && (
                            <span className="ml-3 text-info">Выполняется анализ...</span>
                        )}
                    </div>


                    {analysisResult && (
                        <div className="border rounded p-3 mt-3 bg-light">
                            <h5>Результат анализа</h5>
                            {analysisResult.message && <p><b>Сообщение:</b> {analysisResult.message}</p>}
                            {analysisResult.FileAnalyzed && <p><b>Файл:</b> {analysisResult.FileAnalyzed}</p>}
                            {analysisResult.CarBrand && analysisResult.CarModel && (
                                <p>
                                    <b>Автомобиль:</b> {analysisResult.CarBrand} {analysisResult.CarModel}
                                </p>
                            )}
                            {analysisResult.CountRecords !== undefined && (
                                <p><b>Всего записей:</b> {analysisResult.CountRecords}</p>
                            )}

                            {analysisMethod === "linear_regression" && (
                                <>
                                    {analysisResult.Equation && <p><b>Уравнение:</b> {analysisResult.Equation}</p>}
                                    {analysisResult.MSE !== undefined && <p><b>MSE:</b> {analysisResult.MSE}</p>}
                                    {analysisResult["R^2"] !== undefined && <p><b>R²:</b> {analysisResult["R^2"]}</p>}
                                    {analysisResult.DummyFeatures && (
                                        <>
                                            <p><b>Dummy-переменные:</b></p>
                                            <ul>
                                                {analysisResult.DummyFeatures.map((feat, idx) => (
                                                    <li key={idx}>{feat}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </>
                            )}

                            {analysisMethod === "logistic_regression" && (
                                <div className="border rounded p-3 mt-3 bg-light">
                                    <h5>Результаты логистической регрессии</h5>
                                    <p>
                                        <strong>Файл анализа:</strong>{" "}
                                        {analysisResult.fileAnalyzed || "Неизвестно"}
                                    </p>
                                    <p>
                                        <strong>Порог цены:</strong>{" "}
                                        {analysisResult.priceThreshold
                                            ? Number(analysisResult.priceThreshold).toLocaleString()
                                            : "Неизвестно"}
                                    </p>
                                    <p>
                                        <strong>Точность (accuracy):</strong>{" "}
                                        {analysisResult.accuracy !== undefined
                                            ? analysisResult.accuracy
                                            : "Неизвестно"}
                                    </p>
                                    <p>
                                        <strong>Матрица ошибок:</strong>{" "}
                                        {analysisResult.confusionMatrix
                                            ? typeof analysisResult.confusionMatrix === "object"
                                                ? <pre>{JSON.stringify(analysisResult.confusionMatrix, null, 2)}</pre>
                                                : analysisResult.confusionMatrix
                                            : "Неизвестно"}
                                    </p>
                                    <p>
                                        <strong>Коэффициенты:</strong>{" "}
                                        {analysisResult.coefficients || "Неизвестно"}
                                    </p>
                                    <p>
                                        <strong>Перехват (intercept):</strong>{" "}
                                        {analysisResult.intercept || "Неизвестно"}
                                    </p>
                                    <p>
                                        <strong>Признаки:</strong>{" "}
                                        {analysisResult.features || "Неизвестно"}
                                    </p>
                                    <p style={{whiteSpace: "pre-line"}}>
                                        <strong>Пояснение:</strong>{" "}
                                        {analysisResult.explanation || "Неизвестно"}
                                    </p>
                                    <div className="mt-3">
                                        <p>
                                            <strong>График:</strong>
                                        </p>
                                        {analysisResult.imgBase64 ? (
                                            <img
                                                src={
                                                    analysisResult.imgBase64.startsWith("data:")
                                                        ? analysisResult.imgBase64
                                                        : `data:image/png;base64,${analysisResult.imgBase64}`
                                                }
                                                alt="График анализа"
                                                style={{maxWidth: "500px", border: "1px solid #ccc"}}
                                            />
                                        ) : (
                                            <p>Неизвестно</p>
                                        )}
                                    </div>
                                    <p>
                                        <strong>Дата анализа:</strong>{" "}
                                        {analysisResult.createdAt
                                            ? new Date(analysisResult.createdAt).toLocaleString()
                                            : "Неизвестно"}
                                    </p>
                                </div>
                            )}

                            {analysisParam === "future_price" && (
                                <>
                                    <p><b>Год:</b> {analysisResult.futureYear}</p>
                                    <p><b>Пробег:</b> {analysisResult.futureMileage}</p>
                                    <p><b>Объем двигателя:</b> {analysisResult.futureEngineVolume}</p>
                                    <p><b>Топливо:</b> {analysisResult.futureFuel}</p>
                                    <p><b>Трансмиссия:</b> {analysisResult.futureTransmission}</p>
                                    <p style={{whiteSpace: "pre-line"}}>
                                        <b>Пояснение:</b><br/>{analysisResult.analysisResult}
                                    </p>
                                    {analysisResult.priceDistributionPlot && (
                                        <img
                                            src={`data:image/png;base64,${analysisResult.priceDistributionPlot}`}
                                            alt="Гистограмма"
                                            style={{maxWidth: "500px", border: "1px solid #ccc"}}
                                        />
                                    )}
                                </>
                            )}

                            {analysisParam === "epoch_analysis" && (
                                <>
                                    <p><b>Epochs:</b> {analysisResult.epochs}</p>
                                    <p><b>Batch Size:</b> {analysisResult.batchSize}</p>
                                    <p style={{whiteSpace: "pre-line"}}>
                                        <b>Результат:</b><br/>{analysisResult.analysisResult}
                                    </p>
                                    {analysisResult.epochTrainingPlot && (
                                        <img
                                            src={`data:image/png;base64,${analysisResult.epochTrainingPlot}`}
                                            alt="Epoch Training"
                                            style={{maxWidth: "500px", border: "1px solid #ccc"}}
                                        />
                                    )}
                                </>
                            )}

                            {analysisResult.PlotPath && (
                                <div className="mt-3">
                                    <p><b>График:</b></p>
                                    <img
                                        src={analysisResult.PlotPath}
                                        alt="График"
                                        style={{maxWidth: "500px", border: "1px solid #ccc"}}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-3">
                        <button className="btn btn-primary mr-2" onClick={handleExportExcel}>
                            Экспорт в Excel
                        </button>
                        <button
                            className="btn btn-success mr-2"
                            onClick={() => {
                                if (analysisMethod === "linear_regression") {
                                    handleSaveToDb();
                                } else {
                                    alert("Данные были автоматически сохранены после выполнения анализа.");
                                }
                            }}
                        >
                            Сохранить в БД
                        </button>

                        <button className="btn btn-info" onClick={handleDownloadAnalyzedFile}>
                            Скачать анализ в Excel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Файл для анализа не выбран.</p>
                    <p>
                        Перейдите во вкладку{" "}
                        <span
                            className="text-primary text-decoration-underline"
                            style={{cursor: "pointer"}}
                            onClick={() =>
                                alert("Перейдите в вкладку 'Данные о машинах' и выберите файл.")
                            }
                        >
              Данные о машинах
            </span>{" "}
                        и выберите нужный файл.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AnalysisTab;
