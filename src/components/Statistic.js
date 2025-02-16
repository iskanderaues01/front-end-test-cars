import React, { useState, useEffect } from "react";
import axios from "axios";
// В начале файла (рядом с import React...):
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


const CarFileFilterWithMenu = () => {
    // ------------------------------------------------------
    // 1. Управление вкладками (меню слева)
    // ------------------------------------------------------
    const [activeTab, setActiveTab] = useState("home");
    const [imageLoading, setImageLoading] = useState(false);
// Храним массив записей истории анализа
    const [analysisHistoryList, setAnalysisHistoryList] = useState([]);

    const [brandFilter, setBrandFilter] = useState("");
    const [minCountFilter, setMinCountFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Если при переключении на вкладку "cars" нужно заново грузить список — зовите fetchData() тут
        if (tab === "cars") {
            fetchData();
        }

        if (tab === "history-statistic-cars") {
            fetchAnalysisHistory();
        }
    };


    // ------------------------------------------------------
    // 2. Данные и фильтр (используются во вкладке "cars")
    // ------------------------------------------------------
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Для выпадающих списков
    const [brands, setBrands] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [minYears, setMinYears] = useState([]);
    const [maxYears, setMaxYears] = useState([]);

    // Выбор пользователя в селектах
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedMinYear, setSelectedMinYear] = useState("");
    const [selectedMaxYear, setSelectedMaxYear] = useState("");

    // Отфильтрованные модели, привязанные к выбранной марке
    const [filteredModels, setFilteredModels] = useState([]);

    // ------------------------------------------------------
    // 3. "Подробнее" (accordion)
    // ------------------------------------------------------
    const [expandedFile, setExpandedFile] = useState(null);
    const [fileDetails, setFileDetails] = useState([]);

    // ------------------------------------------------------
    // 4. Состояние для "Перейти к анализу"
    // ------------------------------------------------------
    // Здесь мы сохраним объект выбранного файла (brand, model, fileName, ...)
    const [analysisFile, setAnalysisFile] = useState(null);
    const [carImage, setCarImage] = useState(null);
    // ------------------------------------------------------
    // 5. Основная загрузка: парсинг fileName -> brand, model, ...

    // Состояния для выбора метода, параметра, результата
    const [analysisMethod, setAnalysisMethod] = useState("");
    const [analysisParam, setAnalysisParam] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false); // индикатор загрузки

// Функция "Запустить анализ"
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
            setAnalysisLoading(true); // показываем индикатор «загрузка»

            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            let finalAnalysisType = analysisMethod;
            // Если выбрана линейная регрессия, то analysisParam = year / mileage / engine_volume / multiple_linear / dummies
            if (analysisMethod === "linear_regression" && analysisParam) {
                finalAnalysisType = analysisParam;
            }

            // Запрос
            const response = await axios.get("http://localhost:8080/api/perform-analysis", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    analysisType: finalAnalysisType, // например year/mileage/engine_volume/multiple_linear/dummies
                    fileName: analysisFile.fileName,
                },
            });

            setAnalysisResult(response.data);
        } catch (err) {
            alert("Ошибка при выполнении анализа: " + err.message);
        } finally {
            setAnalysisLoading(false); // скрываем индикатор «загрузка»
        }
    };

    useEffect(() => {
        if (activeTab === "analysis-scope" && analysisFile) {
            fetchCarImage();
        }
    }, [activeTab, analysisFile]);

    const fetchCarImage = async () => {
        try {
            setImageLoading(true); // показываем индикатор

            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            const response = await axios.get(
                "http://localhost:8080/api/cars/get-car-image",
                {
                    params: { fileName: analysisFile.fileName },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCarImage(response.data.imageUrl); // сохраняем URL из поля imageUrl
        } catch (err) {
            setError("Ошибка при загрузке изображения: " + err.message);
            setCarImage(null);
        } finally {
            setImageLoading(false); // скрываем индикатор
        }
    };


    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            const response = await axios.get("http://localhost:8080/api/cars/list-parser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // fileName вида "bmw_528_2010_2015_7.json"
            const parsedFiles = response.data.map((item) => {
                const withoutExt = item.fileName.replace(".json", "");
                const [brand, model, minY, maxY, pages] = withoutExt.split("_");

                return {
                    fileName: item.fileName,
                    creationDate: item.creationDate,
                    fileSize: item.fileSize,
                    brand,
                    model,
                    minYear: minY,
                    maxYear: maxY,
                    pages,
                };
            });

            setFiles(parsedFiles);

            // Уникальные поля для селектов
            const brandSet = new Set();
            const modelSet = new Set();
            const minYearSet = new Set();
            const maxYearSet = new Set();

            parsedFiles.forEach((f) => {
                brandSet.add(f.brand);
                modelSet.add(f.model);
                minYearSet.add(f.minYear);
                maxYearSet.add(f.maxYear);
            });

            setBrands([...brandSet].sort());
            setAllModels([...modelSet].sort());
            setMinYears([...minYearSet].sort());
            setMaxYears([...maxYearSet].sort());
        } catch (err) {
            setError("Ошибка при загрузке данных: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------
    // 6. Обработчики селектов
    // ------------------------------------------------------
    const handleBrandChange = (e) => {
        const newBrand = e.target.value;
        setSelectedBrand(newBrand);
        setSelectedModel("");

        if (newBrand) {
            const brandSpecificModels = files
                .filter((f) => f.brand === newBrand)
                .map((f) => f.model);

            setFilteredModels([...new Set(brandSpecificModels)].sort());
        } else {
            setFilteredModels(allModels);
        }
    };

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    const handleMinYearChange = (e) => {
        setSelectedMinYear(e.target.value);
    };

    const handleMaxYearChange = (e) => {
        setSelectedMaxYear(e.target.value);
    };

    // ------------------------------------------------------
    // 7. Фильтрация (по селектам)
    // ------------------------------------------------------
    const getFilteredFiles = () => {
        return files.filter((f) => {
            if (selectedBrand && f.brand !== selectedBrand) {
                return false;
            }
            if (selectedModel && f.model !== selectedModel) {
                return false;
            }
            if (selectedMinYear && f.minYear !== selectedMinYear) {
                return false;
            }
            if (selectedMaxYear && f.maxYear !== selectedMaxYear) {
                return false;
            }
            return true;
        });
    };
    const filteredFiles = getFilteredFiles();

    // ------------------------------------------------------
    // 8. "Подробнее"
    // ------------------------------------------------------
    const handleShowDetails = async (fileName) => {
        if (expandedFile === fileName) {
            // Повторный клик — свернуть
            setExpandedFile(null);
            setFileDetails([]);
            return;
        }

        setExpandedFile(fileName);
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            const response = await axios.get(
                `http://localhost:8080/api/cars/download-car-info/${fileName}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setFileDetails(response.data); // массив [{Title, Price, Year, ...}, ...]
        } catch (err) {
            setError("Ошибка при загрузке деталей: " + err.message);
        }
    };
    // ------------------------------------------------------
    // 9. "Перейти к анализу"
    // ------------------------------------------------------
    // Сохраняем файл в analysisFile и переключаем вкладку
    const handleGoToAnalysis = (fileObj) => {
        setAnalysisFile(fileObj);
        setActiveTab("analysis-scope");
    };


    // Добавьте внутрь вашего компонента CarFileFilterWithMenu (на том же уровне, что и handlePerformAnalysis):

    const handleExportExcel = async () => {
        try {
            // Создаём новую книгу Excel
            const workbook = new ExcelJS.Workbook();
            // Создаём страницу (лист)
            const worksheet = workbook.addWorksheet("Результат анализа");

            // 1) Запишем текстовые поля из analysisResult (если они есть)
            // Пример: делаем строки с ключ=значение
            let rowIndex = 1;
            worksheet.getCell(`A${rowIndex}`).value = "Сообщение:";
            worksheet.getCell(`B${rowIndex}`).value = analysisResult.message || "";
            rowIndex++;

            if (analysisResult.FileAnalyzed) {
                worksheet.getCell(`A${rowIndex}`).value = "Файл:";
                worksheet.getCell(`B${rowIndex}`).value = analysisResult.FileAnalyzed;
                rowIndex++;
            }

            if (analysisResult.CarBrand || analysisResult.CarModel) {
                worksheet.getCell(`A${rowIndex}`).value = "Автомобиль:";
                worksheet.getCell(`B${rowIndex}`).value = `${analysisResult.CarBrand ?? ""} ${analysisResult.CarModel ?? ""}`;
                rowIndex++;
            }

            if (analysisResult.CountRecords !== undefined) {
                worksheet.getCell(`A${rowIndex}`).value = "Всего записей:";
                worksheet.getCell(`B${rowIndex}`).value = analysisResult.CountRecords;
                rowIndex++;
            }

            if (analysisResult.MSE !== undefined) {
                worksheet.getCell(`A${rowIndex}`).value = "MSE:";
                worksheet.getCell(`B${rowIndex}`).value = analysisResult.MSE;
                rowIndex++;
            }

            if (analysisResult["R^2"] !== undefined) {
                worksheet.getCell(`A${rowIndex}`).value = "R²:";
                worksheet.getCell(`B${rowIndex}`).value = analysisResult["R^2"];
                rowIndex++;
            }

            if (analysisResult.Equation) {
                worksheet.getCell(`A${rowIndex}`).value = "Уравнение:";
                worksheet.getCell(`B${rowIndex}`).value = analysisResult.Equation;
                rowIndex++;
            }

            // 2) Если есть график (PlotPath) в формате data:image/png;base64,...
            //    можем встроить как картинку в Excel.
            //    ExcelJS умеет добавлять base64-картинки вот так:
            if (analysisResult.PlotPath && analysisResult.PlotPath.startsWith("data:image/")) {
                // Добавляем картинку в workbook
                const imageId = workbook.addImage({
                    base64: analysisResult.PlotPath, // Ваша строка "data:image/png;base64,...."
                    extension: "png", // или "jpeg", если другой тип
                });
                // Пример: разместим изображение во 2-м столбце (B) от строки rowIndex+1 до rowIndex+15 (как диапазон)
                // Вы можете настроить размеры и позицию, как вам удобнее
                worksheet.addImage(imageId, {
                    tl: { col: 1, row: rowIndex },    // top-left from cell B(rowIndex)
                    br: { col: 5, row: rowIndex + 14 } // bottom-right (размер картинки)
                });

                // Подвинем rowIndex, чтобы следующее содержимое писалось ниже
                rowIndex += 16;
            }

            // 3) Сохраняем workbook в бинарный массив (Buffer), потом в Blob
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

            // 4) Сохраняем файл (используем file-saver)
            // Имя файла, например "analysis_result.xlsx"
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
            const userId = tokenData?.id; // или другой способ узнать userId

            // Формируем тело запроса на основе данных analysisResult
            const requestBody = {
                message: analysisResult?.message ?? "",
                fileAnalyzed: analysisResult?.FileAnalyzed ?? "",
                countRecords: analysisResult?.CountRecords ?? 0,
                mse: analysisResult?.MSE ?? 0,
                rSquared: analysisResult?.["R^2"] ?? 0,
                equation: analysisResult?.Equation ?? "",
                imgBase64: analysisResult?.PlotPath ?? "",        // здесь лежит data:image/png;base64,...
                carBrand: analysisResult?.CarBrand ?? "",
                carModel: analysisResult?.CarModel ?? "",
                dummyFeatures: analysisResult?.DummyFeatures
                    ? JSON.stringify(analysisResult.DummyFeatures)
                    : null
            };

            await axios.post(
                `http://localhost:8080/api/analysis-history/save?userId=${userId}`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Успешно сохранено в БД");
        } catch (err) {
            console.error("Ошибка сохранения в БД:", err);
            alert("Не удалось сохранить в БД: " + err.message);
        }
    };

// Функция загрузки истории анализа
    const fetchAnalysisHistory = async () => {
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            const userId = tokenData?.id; // Или другой способ получить userId

            const response = await axios.get(
                `http://localhost:8080/api/analysis-history/user/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAnalysisHistoryList(response.data);
        } catch (err) {
            console.error("Ошибка при загрузке истории анализов:", err);
            alert("Не удалось загрузить историю анализов: " + err.message);
        }
    };

    const handleDownload = (historyItem) => {
        if (!historyItem.imgBase64) {
            alert("Нет сохранённого изображения для скачивания");
            return;
        }
        const base64Content = historyItem.imgBase64.split(",")[1];
        const contentType = historyItem.imgBase64
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];

        // Преобразуем base64 -> Blob -> скачиваем
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
        link.setAttribute("download", "analysis_image.png"); // Имя сохраняемого файла
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getFilteredHistory = () => {
        return analysisHistoryList.filter((item) => {
            // Фильтр по марке авто (carBrand)
            if (brandFilter && item.carBrand) {
                // приведём к нижнему регистру для удобства
                const brandLower = item.carBrand.toLowerCase();
                const filterLower = brandFilter.toLowerCase();
                if (!brandLower.includes(filterLower)) {
                    return false;
                }
            }

            // Фильтр по количеству записей (минимум)
            if (minCountFilter) {
                const count = item.countRecords ?? 0; // если null, считаем 0
                if (count < parseInt(minCountFilter, 10)) {
                    return false;
                }
            }

            // Фильтр по дате (допустим, только проверяем, что item.createdAt >= dateFilter)
            if (dateFilter && item.createdAt) {
                // dateFilter в формате "YYYY-MM-DD", преобразуем его и сравниваем
                const filterDate = new Date(dateFilter);
                const createdAtDate = new Date(item.createdAt);
                // если создана раньше фильтра, отбрасываем
                if (createdAtDate < filterDate) {
                    return false;
                }
            }

            return true;
        });
    };


    const handleDownloadAnalyzedFile = async () => {
        // Проверяем, есть ли вообще имя файла
        if (!analysisResult?.FileAnalyzed) {
            alert("Не найдено имя файла для скачивания.");
            return;
        }

        try {
            // 1) Получаем токен из localStorage
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            // 2) Делаем запрос к серверу, который вернёт JSON (массив объектов, напр. [{Title, Price, Year, ...}, ...])
            //    Убираем responseType: "blob", т.к. нужно принять именно JSON
            const response = await axios.get(
                `http://localhost:8080/api/cars/download-car-info/${analysisResult.FileAnalyzed}`,
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

            // 3) Создаём workbook через exceljs
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("AnalyzedData");

            // 4) Описываем столбцы Excel (header — название колонки, key — поле JSON, width — ширина)
            worksheet.columns = [
                { header: "Title",          key: "Title",          width: 25 },
                { header: "Price",          key: "Price",          width: 15 },
                { header: "Year",           key: "Year",           width: 10 },
                { header: "Link",           key: "Link",           width: 40 },
                { header: "ConditionBody",  key: "ConditionBody",  width: 20 },
                { header: "EngineVolume",   key: "EngineVolume",   width: 15 },
                { header: "Fuel",           key: "Fuel",           width: 10 },
                { header: "Transmission",   key: "Transmission",   width: 15 },
                { header: "Mileage",        key: "Mileage",        width: 12 },
                { header: "RawDescription", key: "RawDescription", width: 40 },
            ];

            // 5) Заполняем строками из jsonData
            jsonData.forEach((item) => {
                worksheet.addRow(item);
            });

            // 6) Превращаем Workbook в буфер, создаём Blob и скачиваем
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // 7) Сохраняем файл с помощью file-saver
            //    Имя файла берём, например, из analysisResult.FileAnalyzed, либо своё
            const fileName = analysisResult.FileAnalyzed.replace(".json", ".xlsx") || "analyzed_data.xlsx";
            saveAs(blob, fileName);
        } catch (err) {
            console.error("Ошибка при скачивании/преобразовании:", err);
            alert("Не удалось скачать данные в Excel: " + err.message);
        }
    };
    // ------------------------------------------------------
    // 10. Рендер
    // ------------------------------------------------------
    return (
        <div className="container-fluid vh-100 d-flex">
            {/* Боковое меню (слева), аналогично BoardAdmin */}
            <div className="col-2 bg-light text-dark p-3">
                <ul className="nav flex-column">
                    <li
                        className={`nav-item p-2 ${activeTab === "home" ? "bg-primary text-white" : ""}`}
                        onClick={() => handleTabChange("home")}
                    >
                        <span className="nav-link curs-pointer">Главная</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${activeTab === "cars" ? "bg-primary text-white" : ""}`}
                        onClick={() => handleTabChange("cars")}
                    >
                        <span className="nav-link curs-pointer">Каталог данных о машинах</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${activeTab === "history-statistic-cars" ? "bg-primary text-white" : ""}`}
                        onClick={() => handleTabChange("history-statistic-cars")}
                    >
                        <span className="nav-link curs-pointer">История статистики</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${
                            activeTab === "analysis-scope" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleTabChange("analysis-scope")}
                    >
                        <span className="nav-link curs-pointer">Анализ данных</span>
                    </li>
                </ul>
            </div>

            {/* Основной контент (справа) */}
            <div className="col-10 p-4">
                {/* Вкладка 1: Главная */}
                {activeTab === "home" && (
                    <h1>Добро пожаловать в панель работы со статистикой!</h1>
                )}

                {/* Вкладка 2: Данные о машинах (фильтр + таблица) */}
                {activeTab === "cars" && (
                    <div>
                        <h3>Фильтрация данных о машинах</h3>

                        {loading && <p>Загрузка...</p>}
                        {error && <div className="alert alert-danger">{error}</div>}

                        {/* Блок селектов */}
                        <div className="row mb-3">
                            <div className="col-md-3">
                                <label>Марка</label>
                                <select
                                    className="form-control"
                                    value={selectedBrand}
                                    onChange={handleBrandChange}
                                >
                                    <option value="">Все</option>
                                    {brands.map((b) => (
                                        <option key={b} value={b}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label>Модель</label>
                                <select
                                    className="form-control"
                                    value={selectedModel}
                                    onChange={handleModelChange}
                                    disabled={!selectedBrand}
                                >
                                    <option value="">Все</option>
                                    {(selectedBrand ? filteredModels : allModels).map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label>Мин. год</label>
                                <select
                                    className="form-control"
                                    value={selectedMinYear}
                                    onChange={handleMinYearChange}
                                >
                                    <option value="">Все</option>
                                    {minYears.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label>Макс. год</label>
                                <select
                                    className="form-control"
                                    value={selectedMaxYear}
                                    onChange={handleMaxYearChange}
                                >
                                    <option value="">Все</option>
                                    {maxYears.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Таблица с отфильтрованными файлами */}
                        {filteredFiles.length > 0 ? (
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>Название файла</th>
                                    <th>Марка</th>
                                    <th>Модель</th>
                                    <th>Мин. год</th>
                                    <th>Макс. год</th>
                                    <th>Кол-во стр.</th>
                                    <th>Размер (байт)</th>
                                    <th>Дата создания</th>
                                    <th>Операции</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredFiles.map((f, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr>
                                            <td>{f.fileName}</td>
                                            <td>{f.brand}</td>
                                            <td>{f.model}</td>
                                            <td>{f.minYear}</td>
                                            <td>{f.maxYear}</td>
                                            <td>{f.pages}</td>
                                            <td>{f.fileSize}</td>
                                            <td>{new Date(f.creationDate).toLocaleString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-info btn-sm mr-1 mb-1"
                                                    onClick={() => handleShowDetails(f.fileName)}
                                                >
                                                    Подробнее
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm mb-1"
                                                    onClick={() => handleGoToAnalysis(f)}
                                                >
                                                    Перейти к анализу
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Раскрывающаяся часть (accordion) */}
                                        {expandedFile === f.fileName && (
                                            <tr>
                                                <td colSpan="9">
                                                    {fileDetails && fileDetails.length > 0 ? (
                                                        <table className="table table-bordered mt-3">
                                                            <thead>
                                                            <tr>
                                                                <th>Название</th>
                                                                <th>Год</th>
                                                                <th>Цена</th>
                                                                <th>Пробег</th>
                                                                <th>Объем двигателя</th>
                                                                <th>Топливо</th>
                                                                <th>Кузов</th>
                                                                <th>Трансмиссия</th>
                                                                <th>Ссылка</th>
                                                                <th>Описание</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {fileDetails.map((car, i) => (
                                                                <tr key={i}>
                                                                    <td>{car.Title}</td>
                                                                    <td>{car.Year}</td>
                                                                    <td>{car.Price}</td>
                                                                    <td>{car.Mileage}</td>
                                                                    <td>{car.EngineVolume}</td>
                                                                    <td>{car.Fuel}</td>
                                                                    <td>{car.ConditionBody}</td>
                                                                    <td>{car.Transmission}</td>
                                                                    <td>
                                                                        <a
                                                                            href={car.Link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Перейти
                                                                        </a>
                                                                    </td>
                                                                    <td>{car.RawDescription}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p>Нет данных или идёт загрузка...</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            !loading && <p>Нет данных для отображения.</p>
                        )}
                    </div>
                )}


                {activeTab === "history-statistic-cars" && (() => {
                    const filteredHistory = getFilteredHistory(); // <-- ВАЖНО: объявляем здесь

                    return (
                        <div>
                            <h1>История сохраненных анализов данных</h1>

                            {/* Блок фильтров */}
                            <div className="row mb-3">
                                {/* Фильтр по марке */}
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

                                {/* Фильтр по количеству записей (минимум) */}
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

                                {/* Фильтр по дате */}
                                <div className="col-md-4">
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
                                        <th>MSE</th>
                                        <th>R²</th>
                                        <th>Название файла</th>
                                        <th>Операции</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredHistory.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.carBrand ?? "Неизвестно"}</td>
                                            <td>{item.carModel ?? "Неизвестно"}</td>
                                            <td>{item.countRecords ?? "Неизвестно"}</td>
                                            <td>
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleString()
                                                    : "Неизвестно"}
                                            </td>
                                            <td>{item.mse ?? "Неизвестно"}</td>
                                            <td>{item.rsquared ?? "Неизвестно"}</td>
                                            <td>{item.fileAnalyzed ?? "Неизвестно"}</td>
                                            <td>
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleDownload(item)}
                                                >
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
                })()}



                {/* Вкладка 4: "analysis-scope" */}
                {activeTab === "analysis-scope" && (
                    <div>
                        <h2>Анализ авто</h2>
                        {analysisFile ? (
                            <div>
                                <p>
                                    <b>Название файла:</b> {analysisFile.fileName}
                                </p>
                                <p>
                                    <b>Марка:</b> {analysisFile.brand}
                                </p>
                                <p>
                                    <b>Модель:</b> {analysisFile.model}
                                </p>
                                <p>
                                    <b>От года:</b> {analysisFile.minYear}, <b>До года:</b>{" "}
                                    {analysisFile.maxYear}
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
                                <p>
                                    Для начала анализа выберите метод анализа и параметры.
                                </p>
                                {/* Выбор метода анализа */}
                                <div className="mb-3">
                                    <label htmlFor="analysisMethod" style={{ fontWeight: "bold" }}>Метод анализа</label>
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

                                {/* Если метод "Линейная регрессия", показываем выпадающий список признаков */}
                                {analysisMethod === "linear_regression" && (
                                    <div className="mb-3">
                                        <label htmlFor="analysisParam" style={{ fontWeight: "bold" }}>Признак (переменная)</label>
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
                                            <option value="dummies">
                                                Множественная + категории (dummy)
                                            </option>
                                        </select>
                                        <small className="text-muted">
                                            Выберите конкретный признак или «Множественная регрессия».
                                        </small>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <button className="btn btn-primary" onClick={handlePerformAnalysis}>
                                        Запустить анализ
                                    </button>
                                    {analysisLoading && (
                                        <span className="ml-3 text-info">Выполняется анализ...</span>
                                    )}
                                </div>


                                {analysisResult && (
                                    <div className="border rounded p-3 mt-3 bg-light">
                                        <h5>Результат анализа</h5>
                                        <p style={{ whiteSpace: "pre-line" }}>
                                            <b>Сообщение:</b> {analysisResult.message}
                                        </p>

                                        {/* Может быть не у всех вариантов есть CountRecords, MSE, R^2 и т.д. */}
                                        {analysisResult.FileAnalyzed && (
                                            <p><b>Файл:</b> {analysisResult.FileAnalyzed}</p>
                                        )}
                                        {analysisResult.CarBrand && analysisResult.CarModel && (
                                            <p>
                                                <b>Автомобиль:</b> {analysisResult.CarBrand} {analysisResult.CarModel}
                                            </p>
                                        )}
                                        {analysisResult.CountRecords !== undefined && (
                                            <p><b>Всего записей:</b> {analysisResult.CountRecords}</p>
                                        )}
                                        {analysisResult.MSE !== undefined && (
                                            <p><b>MSE:</b> {analysisResult.MSE}</p>
                                        )}
                                        {analysisResult["R^2"] !== undefined && (
                                            <p><b>R²:</b> {analysisResult["R^2"]}</p>
                                        )}
                                        {analysisResult.Equation && (
                                            <p><b>Уравнение:</b> {analysisResult.Equation}</p>
                                        )}

                                        {/* PlotPath, если это URL (например, /static/plot... или http://...) */}
                                        {analysisResult.PlotPath && (
                                            <div className="mt-2">
                                                <p><b>График (Plot):</b></p>
                                                <img
                                                    src={analysisResult.PlotPath}         // <-- теперь это "data:image/png;base64,..."
                                                    alt="Plot"
                                                    style={{ maxWidth: "500px", border: "1px solid #ccc" }}
                                                />
                                            </div>
                                        )}


                                        {/* DummyFeatures, если есть */}
                                        {analysisResult.DummyFeatures && (
                                            <div className="mt-2">
                                                <p><b>Учтённые категориальные переменные (dummies):</b></p>
                                                <ul>
                                                    {analysisResult.DummyFeatures.map((feat) => (
                                                        <li key={feat}>{feat}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {analysisResult && (
                                    <div className="border rounded p-3 mt-3 bg-light">
                                        <h5>Результат анализа</h5>
                                        {/* ... вывод всех analysisResult.* ... */}

                                        {/* Кнопка для экспорта в Excel */}
                                        <div>
                                            <button className="btn btn-success mt-3 mr-3" onClick={handleExportExcel}>
                                                Экспорт результата в Excel
                                            </button>

                                            <button className="btn btn-info mt-3" onClick={handleSaveToDb}>
                                                Сохранить в БД
                                            </button>

                                            <button
                                                className="btn btn-primary mt-3 ml-3"
                                                onClick={handleDownloadAnalyzedFile}
                                            >
                                                Скачать Данные
                                            </button>
                                        </div>


                                    </div>
                                )}

                            </div>
                        ) : (
                            <div>
                                <p>Файл для анализа не выбран.</p>
                                <p>
                                Перейдите во вкладку{" "}
                                    <span
                                        className="text-primary text-decoration-underline"
                                        style={{cursor: "pointer"}}
                                        onClick={() => setActiveTab("cars")}
                                    >
                    Данные о машинах
                  </span>{" "}
                                    и выберите нужный файл.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarFileFilterWithMenu;
