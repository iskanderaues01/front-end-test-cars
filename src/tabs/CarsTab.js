import React, { useState, useEffect } from "react";
import axios from "axios";

const CarsTab = ({ handleSetAnalysisFile }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [brands, setBrands] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [minYears, setMinYears] = useState([]);
    const [maxYears, setMaxYears] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedMinYear, setSelectedMinYear] = useState("");
    const [selectedMaxYear, setSelectedMaxYear] = useState("");
    const [filteredModels, setFilteredModels] = useState([]);
    const [expandedFile, setExpandedFile] = useState(null);
    const [fileDetails, setFileDetails] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            const response = await axios.get("http://localhost:8080/api/cars/list-parser", {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Преобразуем fileName вида "bmw_528_2010_2015_7.json"
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

            // Формируем уникальные списки для селектов
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

    const handleBrandChange = (e) => {
        const newBrand = e.target.value;
        setSelectedBrand(newBrand);
        setSelectedModel("");
        if (newBrand) {
            const brandSpecificModels = files.filter((f) => f.brand === newBrand).map((f) => f.model);
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

    const getFilteredFiles = () => {
        return files.filter((f) => {
            if (selectedBrand && f.brand !== selectedBrand) return false;
            if (selectedModel && f.model !== selectedModel) return false;
            if (selectedMinYear && f.minYear !== selectedMinYear) return false;
            if (selectedMaxYear && f.maxYear !== selectedMaxYear) return false;
            return true;
        });
    };

    const filteredFiles = getFilteredFiles();

    const handleShowDetails = async (fileName) => {
        if (expandedFile === fileName) {
            setExpandedFile(null);
            setFileDetails([]);
            return;
        }
        setExpandedFile(fileName);
        try {
            const tokenData = JSON.parse(localStorage.getItem("user"));
            const token = tokenData?.token;
            const response = await axios.get(`http://localhost:8080/api/cars/download-car-info/${fileName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFileDetails(response.data);
        } catch (err) {
            setError("Ошибка при загрузке деталей: " + err.message);
        }
    };

    // При выборе файла для анализа вызываем функцию из пропсов
    const handleGoToAnalysis = (fileObj) => {
        handleSetAnalysisFile(fileObj);
    };

    return (
        <div>
            <h3>Фильтрация данных о машинах</h3>
            {loading && <p>Загрузка...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row mb-3">
                <div className="col-md-3">
                    <label>Марка</label>
                    <select className="form-control" value={selectedBrand} onChange={handleBrandChange}>
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
                    <select className="form-control" value={selectedModel} onChange={handleModelChange} disabled={!selectedBrand}>
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
                    <select className="form-control" value={selectedMinYear} onChange={handleMinYearChange}>
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
                    <select className="form-control" value={selectedMaxYear} onChange={handleMaxYearChange}>
                        <option value="">Все</option>
                        {maxYears.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

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
                                    <button className="btn btn-primary btn-sm mb-1" onClick={() => handleGoToAnalysis(f)}>
                                        Перейти к анализу
                                    </button>
                                </td>
                            </tr>
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
                                                            <a href={car.Link} target="_blank" rel="noopener noreferrer">
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
    );
};

export default CarsTab;
