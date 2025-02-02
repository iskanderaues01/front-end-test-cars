import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistic = () => {
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

    return (

        <div className="container-fluid vh-100 d-flex">
            {/* Боковое меню */}
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

            {/* Основное содержимое */}
            <div className="col-10 p-4">
                {activeTab === "home" && <h1>Добро пожаловать в панель администратора!</h1>}

                {activeTab === "cars" && (
                    <div>
                        <h1>Файлы данных о машинах</h1>

                        {loading && <p>Загрузка данных...</p>}
                        {error && <p className="text-danger">{error}</p>}

                        {!loading && !error && (
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>Название файла</th>
                                    <th>Дата создания</th>
                                    <th>Размер файла (байты)</th>
                                    <th>Операции</th>
                                </tr>
                                </thead>
                                <tbody>
                                {carList.map((file, index) => (
                                    // Используем React.Fragment, чтобы можно было отрендерить
                                    // дополнительную строку под каждой записью
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td>{file.fileName}</td>
                                            <td>{new Date(file.creationDate).toLocaleString()}</td>
                                            <td>{file.fileSize}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm marg-r-20"
                                                    onClick={() => handleDelete(file.fileName)}
                                                >
                                                    Удалить
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm marg-r-20"
                                                    onClick={() => handleDownload(file.fileName)}
                                                >
                                                    Скачать
                                                </button>
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => fetchFileDetails(file.fileName)}
                                                >
                                                    Подробнее
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Если файл "развёрнут", показываем доп. строку со сведениями */}
                                        {expandedFile === file.fileName && (
                                            <tr>
                                                {/* colSpan равен количеству столбцов в основной строке */}
                                                <td colSpan="4">
                                                    {/* Можно показать "Загрузка..." или проверять fileDetails.length == 0.
                                В данном случае, если fileDetails пуст или не пришёл, можно вывести сообщение. */}
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
                                                            {fileDetails.map((car, idx) => (
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
                                                                    <td>{car.RawDescription}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p>Нет данных для отображения.</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        )}

                        {/* Модальное окно для сообщения */}
                        {modalMessage && (
                            <div className="modal show d-block" tabIndex="-1">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Сообщение</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setModalMessage(null)}
                                            ></button>
                                        </div>
                                        <div className="modal-body">
                                            <p>{modalMessage}</p>
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setModalMessage(null)}
                                            >
                                                Закрыть
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "add-cars" && (
                    <div>
                        <h1>Загрузите новые данные об автомобилях</h1>
                        <a href="https://kolesa.kz/" className="text-decoration-none">
                            Данные берутся с сайта kolesa.kz
                        </a>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="carBrand">Марка автомобиля</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="carBrand"
                                    value={formData.carBrand}
                                    onChange={(e) => handleChange("carBrand", e.target.value)}
                                    placeholder="Введите марку автомобиля, например Toyota"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="carModel">Модель автомобиля</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="carModel"
                                    value={formData.carModel}
                                    onChange={(e) => handleChange("carModel", e.target.value)}
                                    placeholder="Введите модель автомобиля, например Сamry"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateStart">Начальный год</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="dateStart"
                                    value={formData.dateStart}
                                    onChange={(e) => handleChange("dateStart", e.target.value)}
                                    placeholder="Введите начальный год, например 2001"
                                    min="1950"
                                    max={new Date().getFullYear()}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateMax">Конечный год</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="dateMax"
                                    value={formData.dateMax}
                                    onChange={(e) => handleChange("dateMax", e.target.value)}
                                    placeholder="Введите конечный год, например 2025"
                                    min="1950"
                                    max={new Date().getFullYear()}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="countPages">Количество страниц</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="countPages"
                                    value={formData.countPages}
                                    onChange={(e) => handleChange("countPages", e.target.value)}
                                    placeholder="Введите количество страниц, например 7"
                                />
                            </div>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="saveToDb"
                                    checked={formData.saveToDb}
                                    onChange={(e) => handleChange("saveToDb", e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="saveToDb">
                                    Сохранить в Базу Данных
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary mt-3">
                                Собрать данные
                            </button>

                            {/* Показ индикатора загрузки */}
                            {loading && (
                                <div className="text-center mt-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Загрузка...</span>
                                    </div>
                                </div>
                            )}

                            {/* Показ сообщения об успехе или ошибке */}
                            {responseMessage && (
                                <div className="alert alert-info mt-3" role="alert">
                                    {responseMessage}
                                </div>
                            )}
                        </form>

                        {/* Итоговая таблица с отображением данных */}
                        {savedData.length > 0 && (
                            <div className="mt-5">
                                <h3>Итоговая сохраненная таблица в БД</h3>
                                <table className="table table-bordered table-striped">
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
                                    {savedData.map((car, index) => (
                                        <tr key={index}>
                                            <td>{car.Title}</td>
                                            <td>{car.Year}</td>
                                            <td>{car.Price}</td>
                                            <td>{car.Mileage}</td>
                                            <td>{car.EngineVolume} л</td>
                                            <td>{car.Fuel}</td>
                                            <td>{car.ConditionBody}</td>
                                            <td>{car.Transmission}</td>
                                            <td>
                                                <a href={car.Link} target="_blank" rel="noopener noreferrer">
                                                    Перейти
                                                </a>
                                            </td>
                                            <td>{car.RawDescription}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>


    // VTY<<<,><>>
    <div className="container mt-4">
        <h2>Список сохранённых файлов</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Форма с выпадающими списками */}
        <div className="row mb-3">
            <div className="col-md-3">
                <label>Марка</label>
                <select
                    className="form-control"
                    value={selectedBrand}
                    onChange={handleBrandChange}
                >
                    <option value="">Все</option>
                    {brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
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
                    disabled={!selectedBrand} // блокируем, если марка не выбрана
                >
                    <option value="">Все</option>
                    {(selectedBrand ? filteredModels : models).map((model) => (
                        <option key={model} value={model}>
                            {model}
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
                    {minYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
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
                    {maxYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Итоговая таблица */}
        <table className="table table-bordered table-striped">
            <thead>
            <tr>
                <th>Название файла</th>
                <th>Марка</th>
                <th>Модель</th>
                <th>Мин. год</th>
                <th>Макс. год</th>
                <th>Кол-во стр.</th>
                <th>Дата создания</th>
                <th>Размер (байт)</th>
            </tr>
            </thead>
            <tbody>
            {filteredFiles.map((file, index) => (
                <tr key={index}>
                    <td>{file.fileName}</td>
                    <td>{file.brand}</td>
                    <td>{file.model}</td>
                    <td>{file.minYear}</td>
                    <td>{file.maxYear}</td>
                    <td>{file.pages}</td>
                    <td>{new Date(file.creationDate).toLocaleString()}</td>
                    <td>{file.fileSize}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
)
    ;
};

export default Statistic;