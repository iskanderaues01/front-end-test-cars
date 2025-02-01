import React, {useEffect, useState} from "react";
import axios from "axios";

const Statistic = () => {
    const [activeTab, setActiveTab] = useState("tab1");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Исходные данные с сервера после парсинга
    const [files, setFiles] = useState([]);

    // Списки (для выпадающих меню)
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [minYears, setMinYears] = useState([]);
    const [maxYears, setMaxYears] = useState([]);

    // Выбранные значения в селектах
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedMinYear, setSelectedMinYear] = useState("");
    const [selectedMaxYear, setSelectedMaxYear] = useState("");

    // Модели, которые доступны для выбранной марки
    const [filteredModels, setFilteredModels] = useState([]);

    // Ошибка/уведомления
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    // Получаем список (JSON) с сервера
    const fetchFiles = async () => {
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;

            const response = await axios.get(
                "http://localhost:8080/api/cars/list-parser",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // response.data = [{fileName, creationDate, fileSize}, ...]
            const serverData = response.data;

            // Парсим fileName вида "bmw_528_2010_2015_7.json"
            // => brand="bmw", model="528", minYear="2010", maxYear="2015", pages="7"
            const parsedFiles = serverData.map((item) => {
                const nameWithoutExt = item.fileName.replace(".json", "");
                const parts = nameWithoutExt.split("_");
                // parts[0] = brand, parts[1] = model, parts[2] = minYear, parts[3] = maxYear, parts[4] = pages

                return {
                    brand: parts[0],
                    model: parts[1],
                    minYear: parts[2],
                    maxYear: parts[3],
                    pages: parts[4],
                    fileName: item.fileName,
                    creationDate: item.creationDate,
                    fileSize: item.fileSize,
                };
            });

            // Заполняем стейт
            setFiles(parsedFiles);

            // Собираем уникальные значения для brand, model, minYear, maxYear
            const uniqueBrands = new Set();
            const uniqueModels = new Set();
            const uniqueMinYears = new Set();
            const uniqueMaxYears = new Set();

            parsedFiles.forEach((f) => {
                uniqueBrands.add(f.brand);
                uniqueModels.add(f.model);
                uniqueMinYears.add(f.minYear);
                uniqueMaxYears.add(f.maxYear);
            });

            setBrands(Array.from(uniqueBrands));
            setModels(Array.from(uniqueModels));
            setMinYears(Array.from(uniqueMinYears).sort());
            setMaxYears(Array.from(uniqueMaxYears).sort());
        } catch (err) {
            setError(`Ошибка при получении списка: ${err.message}`);
        }
    };

    // При выборе марки — сбрасываем выбранную модель,
    // получаем список моделей, относящихся к этой марке
    const handleBrandChange = (e) => {
        const newBrand = e.target.value;
        setSelectedBrand(newBrand);
        setSelectedModel(""); // сброс модели

        // Фильтруем модели, привязанные только к этой марке
        const brandModels = files
            .filter((f) => f.brand === newBrand)
            .map((f) => f.model);

        // Убираем дубли
        const uniqueBrandModels = Array.from(new Set(brandModels));
        setFilteredModels(uniqueBrandModels);
    };

    // При выборе модели
    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    // При выборе минимального года
    const handleMinYearChange = (e) => {
        setSelectedMinYear(e.target.value);
    };

    // При выборе максимального года
    const handleMaxYearChange = (e) => {
        setSelectedMaxYear(e.target.value);
    };

    // Фильтрация итогового списка в соответствии с выбранными значениями
    const getFilteredFiles = () => {
        return files.filter((f) => {
            // Фильтрация по бренду
            if (selectedBrand && f.brand !== selectedBrand) {
                return false;
            }
            // Фильтрация по модели
            if (selectedModel && f.model !== selectedModel) {
                return false;
            }
            // Фильтрация по minYear
            if (selectedMinYear && f.minYear !== selectedMinYear) {
                return false;
            }
            // Фильтрация по maxYear
            if (selectedMaxYear && f.maxYear !== selectedMaxYear) {
                return false;
            }

            return true;
        });
    };

    const filteredFiles = getFilteredFiles();


    // Состояния для механизма «Подробнее»
    const [expandedFile, setExpandedFile] = useState(null); // какой файл сейчас «развёрнут»
    const [downloadedData, setDownloadedData] = useState([]); // список авто, полученных с сервера

    useEffect(() => {
        fetchFiles();
    }, []);

    // При нажатии «Подробнее» загружаем данные файла
    const handleShowDetails = async (fileName) => {
        // Если мы повторно нажимаем на тот же файл — сворачиваем
        if (expandedFile === fileName) {
            setExpandedFile(null);
            setDownloadedData([]);
            return;
        }

        // Иначе раскрываем новый
        setExpandedFile(fileName);

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
            // Ответ сервера: массив объектов [{Title, Price, Year, ...}, ...]
            setDownloadedData(response.data);
        } catch (err) {
            setError(`Ошибка при загрузке данных файла "${fileName}": ${err.message}`);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex">
            {/* Левая колонка (меню) */}
            <div className="col-2 bg-light text-dark p-3">
                <ul className="nav flex-column">
                    <li
                        className={`nav-item p-2 ${
                            activeTab === "tab1" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleTabChange("tab1")}
                    >
                        <span className="nav-link curs-pointer">Главная</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${
                            activeTab === "tab2" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleTabChange("tab2")}
                    >
                        <span className="nav-link curs-pointer">Список имеющихся авто</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${
                            activeTab === "tab3" ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleTabChange("tab3")}
                    >
                        <span className="nav-link curs-pointer">Добавить данные о машинах</span>
                    </li>
                </ul>
            </div>

            {/* Правая колонка (основной контент) */}
            <div className="col-10 p-4">
                {activeTab === "tab1" && (
                    <div>
                        <h1>Добро пожаловать в панель работы со статистикой!</h1>
                        <p>Подробное описание как работать с данной панелью и что она может</p>
                    </div>
                )}

                {activeTab === "tab2" && (
                    <div className="container mt-4">
                        <h2>Список сохранённых файлов</h2>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <table className="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th>Марка</th>
                                <th>Модель</th>
                                <th>Мин. год</th>
                                <th>Макс. год</th>
                                <th>Кол-во стр.</th>
                                <th>Дата создания</th>
                                <th>Размер (байт)</th>
                                <th>Операции</th>
                            </tr>
                            </thead>
                            <tbody>
                            {files.map((file, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td>{file.brand}</td>
                                        <td>{file.model}</td>
                                        <td>{file.minYear}</td>
                                        <td>{file.maxYear}</td>
                                        <td>{file.pages}</td>
                                        <td>{new Date(file.creationDate).toLocaleString()}</td>
                                        <td>{file.fileSize}</td>
                                        <td>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleShowDetails(file.fileName)}
                                            >
                                                Подробнее
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Если файл "развёрнут", показываем дополнительную строку с таблицей */}
                                    {expandedFile === file.fileName && (
                                        <tr>
                                            {/* colSpan = кол-ву столбцов в основной строке */}
                                            <td colSpan="8">
                                                {downloadedData && downloadedData.length > 0 ? (
                                                    <table className="table table-bordered mt-3">
                                                        <thead>
                                                        <tr>
                                                            <th>Название</th>
                                                            <th>Год</th>
                                                            <th>Цена</th>
                                                            <th>Пробег</th>
                                                            <th>Объём</th>
                                                            <th>Топливо</th>
                                                            <th>Кузов</th>
                                                            <th>КПП</th>
                                                            <th>Ссылка</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {downloadedData.map((car, idx) => (
                                                            <tr key={idx}>
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
                    </div>
                )}

                {activeTab === "tab3" && <div>Содержимое таба 3</div>}
            </div>
        </div>
    );
};

export default Statistic;
