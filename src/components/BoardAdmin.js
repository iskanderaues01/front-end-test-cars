import React, { useState, useEffect } from "react";
import axios from "axios";

const BoardAdmin = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState(null); // Сообщение для модального окна
  const [savedData, setSavedData] = useState([]);

  const [expandedFile, setExpandedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState([]);


  const fetchFileDetails = async (fileName) => {
    // При повторном нажатии на ту же кнопку скрываем блок
    setExpandedFile(fileName === expandedFile ? null : fileName);
    if (fileName !== expandedFile) {
      try {
        const tokenData = JSON.parse(localStorage.getItem("user"));
        const token = tokenData?.token;
        const response = await axios.get(
            `http://localhost:8089/api/cars/get-file/${fileName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        setFileDetails(response.data);
      } catch (err) {
        setModalMessage(
            `Ошибка при получении данных файла "${fileName}": ${err.message}`
        );
      }
    }
  };

  // Функция загрузки списка машин
  const fetchCarList = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenData = JSON.parse(localStorage.getItem("user"));
      const token = tokenData?.token;
      const response = await axios.get(
          "http://localhost:8089/api/cars/list-parser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );
      setCarList(response.data);
    } catch (err) {
      setError("Ошибка при загрузке списка машин.");
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления файла
  const handleDelete = async (fileName) => {
    const confirmDelete = window.confirm(
        `Вы уверены, что хотите удалить файл "${fileName}"?`
    );
    if (confirmDelete) {
      try {
        const tokenData = JSON.parse(localStorage.getItem("user"));
        const token = tokenData?.token;
        const response = await axios.delete(
            `http://localhost:8089/api/cars/delete-file/${fileName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        setModalMessage(`Файл "${fileName}" успешно удалён.`);
        fetchCarList(); // Обновление списка после удаления
      } catch (err) {
        setModalMessage(
            `Ошибка при удалении файла "${fileName}": ${err.message}`
        );
      }
    }
  };

  // Функция скачивания файла
  const handleDownload = async (fileName) => {
    try {
      const tokenData = JSON.parse(localStorage.getItem("user"));
      const token = tokenData?.token;
      const response = await axios.get(
          `http://localhost:8089/api/cars/download-car-info/${fileName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob", // Для загрузки файла в бинарном формате
          }
      );

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Устанавливаем имя загружаемого файла
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setModalMessage(`Ошибка при скачивании файла "${fileName}": ${err.message}`);
    }
  };

  const [formData, setFormData] = useState({
    carBrand: "",
    carModel: "",
    dateStart: "",
    dateMax: "",
    countPages: "",
    saveToDb: false,
  });

  const [responseMessage, setResponseMessage] = useState(null);

  // Обработчик изменения полей формы
  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Обработчик отправки формы
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);
    setSavedData([]); // Очищаем таблицу перед новым запросом

    try {
      const tokenData = JSON.parse(localStorage.getItem("user"));
      const token = tokenData?.token;

      // Приведение значений формы в lowercase
      const lowercaseParams = {
        carBrand: formData.carBrand?.toLowerCase() || "",
        carModel: formData.carModel?.toLowerCase() || "",
        dateStart: formData.dateStart?.toLowerCase() || "",
        dateMax: formData.dateMax?.toLowerCase() || "",
        countPages: formData.countPages?.toString().toLowerCase() || "",
      };

      // Определяем URL запроса
      const url = formData.saveToDb
          ? "http://localhost:8089/api/cars/save-car-data"
          : "http://localhost:8089/api/cars/data-car-date";

      // Отправляем GET-запрос на нужный URL
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: lowercaseParams,
      });

      setSavedData(response.data);

      if (formData.saveToDb) {
        setResponseMessage("Данные успешно собраны и сохранены в базу данных.");
      } else {
        setResponseMessage("Данные успешно собраны.");
      }
    } catch (err) {
      setResponseMessage(`Произошла ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "cars") {
      fetchCarList();
    }
  };

  useEffect(() => {
    fetchCarList();
  }, []);

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
        {activeTab === "home" && (
            <div className="container mt-4">
                <div className="row align-items-center">
                    <div className="col-md-6 mb-4">
                        <h2 className="mb-3">Добро пожаловать в панель администратора!</h2>
                        <p className="lead">
                            Здесь вы можете управлять данными об автомобилях, запускать парсинг с внешних источников и
                            добавлять новую информацию для анализа и прогнозов.
                        </p>
                        <ul className="list-group mb-4">
                            <li className="list-group-item">
                                <strong>📁 Управление файлами:</strong> просматривайте, скачивайте и удаляйте загруженные JSON-файлы с объявлениями.
                            </li>
                            <li className="list-group-item">
                                <strong>🌐 Парсинг:</strong> запускайте автоматический сбор объявлений по заданным марке, модели и диапазону лет.
                            </li>
                            <li className="list-group-item">
                                <strong>➕ Добавление данных:</strong> вручную загружайте новые файлы или создавайте их через встроенную форму.
                            </li>
                            <li className="list-group-item">
                                <strong>📊 Анализ:</strong> переходите во вкладку анализа для запуска ML/регрессионных алгоритмов по выбранным данным.
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-6 text-center">
                        <img
                            src="https://i.ibb.co.com/chw0PhfF/image.png"
                            alt="Админ-панель"
                            className="img-fluid rounded shadow"
                        />
                    </div>
                </div>
            </div>
        )}

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
  );
};

export default BoardAdmin;
