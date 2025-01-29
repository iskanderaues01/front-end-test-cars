import React, { useState, useEffect } from "react";
import axios from "axios";

const BoardAdmin = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState(null); // Сообщение для модального окна

  // Функция загрузки списка машин
  const fetchCarList = async () => {
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
      setCarList(response.data);
    } catch (err) {
      setError("Ошибка при загрузке списка машин.");
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления файла
  const handleDelete = async (fileName) => {
    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`);
    if (confirmDelete) {
      try {
        const tokenData = JSON.parse(localStorage.getItem("user"));
        const token = tokenData?.token;
        const response = await axios.delete(`http://localhost:8080/api/cars/delete-file/${fileName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setModalMessage(`Файл "${fileName}" успешно удалён.`);
        fetchCarList(); // Обновление списка после удаления
      } catch (err) {
        setModalMessage(`Ошибка при удалении файла "${fileName}": ${err.message}`);
      }
    }
  };

  // Функция скачивания файла
  const handleDownload = async (fileName) => {
    try {
      const tokenData = JSON.parse(localStorage.getItem("user"));
      const token = tokenData?.token;
      const response = await axios.get(
          `http://localhost:8080/api/cars/download-car-info/${fileName}`,
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);

    try {
      const tokenData = JSON.parse(localStorage.getItem("user"));
      const token = tokenData?.token;

      // Запрос на парсинг данных
      const parseResponse = await axios.get("http://localhost:8080/api/cars/data-car-date", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          carBrand: formData.carBrand,
          carModel: formData.carModel,
          dateStart: formData.dateStart,
          dateMax: formData.dateMax,
          countPages: formData.countPages,
        },
      });

      // Проверка, нужно ли сохранять данные в БД
      if (formData.saveToDb) {
        await axios.post(
            "http://localhost:8080/api/cars/save-to-db",
            parseResponse.data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
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
                          <tr key={index}>
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
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleDownload(file.fileName)}
                              >
                                Скачать
                              </button>
                            </td>
                          </tr>
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
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="carBrand">Марка автомобиля</label>
                    <input
                        type="text"
                        className="form-control"
                        id="carBrand"
                        value={formData.carBrand}
                        onChange={(e) => handleChange("carBrand", e.target.value)}
                        placeholder="Введите марку автомобиля"
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
                        placeholder="Введите модель автомобиля"
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
                        placeholder="Введите начальный год"
                        min="1900"
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
                        placeholder="Введите конечный год"
                        min="1900"
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
                        placeholder="Введите количество страниц"
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
                      Сохранить в БД
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3">
                    Собрать данные
                  </button>
                </form>

                {/* Индикатор загрузки */}
                {loading && (
                    <div className="text-center mt-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Загрузка...</span>
                      </div>
                    </div>
                )}

                {responseMessage && (
                    <div className="alert alert-info mt-3" role="alert">
                      {responseMessage}
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  );
};

export default BoardAdmin;


