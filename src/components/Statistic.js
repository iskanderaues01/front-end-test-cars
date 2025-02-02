import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistic = () => {
    // ------------------------------------------------------
    // 1. Управление вкладками (меню слева)
    // ------------------------------------------------------
    const [activeTab, setActiveTab] = useState("home");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Если при переключении на вкладку "cars" вам нужно заново грузить список — зовите fetchData() здесь
        if (tab === "cars") {
            fetchData(); // Например, перезагрузить сразу
        }
    };

    // ------------------------------------------------------
    // 2. Данные и фильтр (используются во вкладке "cars")
    // ------------------------------------------------------
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Для селектов
    const [brands, setBrands] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [minYears, setMinYears] = useState([]);
    const [maxYears, setMaxYears] = useState([]);

    // Выбор пользователя
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedMinYear, setSelectedMinYear] = useState("");
    const [selectedMaxYear, setSelectedMaxYear] = useState("");

    // Модели, релевантные выбранной марке
    const [filteredModels, setFilteredModels] = useState([]);

    // ------------------------------------------------------
    // 3. "Подробнее" (accordion)
    // ------------------------------------------------------
    const [expandedFile, setExpandedFile] = useState(null); // какое имя файла сейчас развёрнуто
    const [fileDetails, setFileDetails] = useState([]);     // данные, пришедшие от "Подробнее"

    // ------------------------------------------------------
    // 4. Основная загрузка: парсинг fileName -> brand, model и т.д.
    // ------------------------------------------------------
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

            // Преобразуем fileName вида: "bmw_528_2010_2015_7.json"
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

            // Уникальные значения
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

    // Если вам нужно грузить список только один раз при монтировании,
    // раскомментируйте useEffect (по желанию):
    /*
    useEffect(() => {
      fetchData();
    }, []);
    */

    // ------------------------------------------------------
    // 5. Обработчики для селектов (марка, модель, годы)
    // ------------------------------------------------------
    const handleBrandChange = (e) => {
        const newBrand = e.target.value;
        setSelectedBrand(newBrand);
        setSelectedModel("");

        if (newBrand) {
            // Фильтруем модели, относящиеся только к выбранной марке
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
    // 6. Фильтрация для отображаемой таблицы
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
    // 7. Кнопка "Подробнее" (accordion)
    // ------------------------------------------------------
    const handleShowDetails = async (fileName) => {
        // Тот же файл -> свернуть
        if (expandedFile === fileName) {
            setExpandedFile(null);
            setFileDetails([]);
            return;
        }

        setExpandedFile(fileName); // раскрываем новый

        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            // Запрос на download-car-info
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
    // 8. Рендер
    // ------------------------------------------------------
    return (
        <div className="container-fluid vh-100 d-flex">
            {/* Боковое меню (слева) - как в BoardAdmin */}
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
                        <span className="nav-link curs-pointer">Данные о машинах</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${activeTab === "add-cars" ? "bg-primary text-white" : ""}`}
                        onClick={() => handleTabChange("add-cars")}
                    >
                        <span className="nav-link curs-pointer">Добавить данные о машинах</span>
                    </li>
                </ul>
            </div>

            {/* Основной контент (справа) */}
            <div className="col-10 p-4">
                {/* Вкладка 1: Главная */}
                {activeTab === "home" && (
                    <h1>Добро пожаловать в панель администратора!</h1>
                )}

                {/* Вкладка 2: "Данные о машинах" (с нашей фильтрацией и кнопкой "Подробнее") */}
                {activeTab === "cars" && (
                    <div>
                        <h3>Фильтрация данных о машинах</h3>

                        {loading && <p>Загрузка...</p>}
                        {error && <div className="alert alert-danger">{error}</div>}

                        {/* Блок с выпадающими списками */}
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

                        {/* Таблица с результатами */}
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
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleShowDetails(f.fileName)}
                                                >
                                                    Подробнее
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Раскрывающаяся доп. строка (accordion) */}
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

                {/* Вкладка 3: "Добавить данные о машинах" */}
                {activeTab === "add-cars" && (
                    <div>
                        <h1>Здесь может быть форма добавления данных</h1>
                        <p>Разместите форму или другую логику по вашему усмотрению.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Statistic;
