import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import UserService from "../services/user.service";
import Footer from "./Footer";

const About = () => {
    const [content, setContent] = useState("");

    useEffect(() => {
        UserService.getPublicContent().then(
            (response) => {
                setContent(response.data);
            },
            (error) => {
                const _content =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString();

                setContent(_content);
            }
        );
    }, []);

    return (
        <div
            className="text-white"
            style={{
                backgroundImage: `url("https://i.ibb.co.com/KxkrkhZW/zcpb0nxag8.png")`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh",
                paddingTop: "60px",
                paddingBottom: "60px",
            }}
        >
            <div className="container p-5 rounded shadow-lg" style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}>
                <h1 className="mb-4 text-center">О нас</h1>
                <p className="lead">
                    Добро пожаловать на платформу интеллектуального анализа данных автомобилей!
                    Мы предоставляем инструменты, позволяющие эффективно собирать, обрабатывать,
                    анализировать и экспортировать информацию об автомобилях с различных источников.
                </p>

                <h4 className="mt-4">🔧 Основные возможности:</h4>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent text-white">
                        ✅ <strong>Парсинг данных</strong> с популярных сайтов объявлений: задайте параметры — мы соберём данные по марке, модели и годам.
                    </li>
                    <li className="list-group-item bg-transparent text-white">
                        ✅ <strong>Умный анализ</strong>: линейная и логистическая регрессия, а также машинное обучение для прогнозирования цен.
                    </li>
                    <li className="list-group-item bg-transparent text-white">
                        ✅ <strong>Гибкий экспорт</strong>: сохраняйте результаты в Excel, включая графики, формулы и метрики качества.
                    </li>
                    <li className="list-group-item bg-transparent text-white">
                        ✅ <strong>История анализов</strong>: сохранение результатов в базе данных для повторного просмотра и отчётности.
                    </li>
                </ul>

                <h4 className="mt-5">📊 Инструменты анализа</h4>
                <p>
                    После загрузки или парсинга данных вы можете выбрать метод анализа:
                </p>
                <ul>
                    <li><b>Линейная регрессия</b> — предсказывает цену по признаку: год, пробег, объём и т.д.</li>
                    <li><b>Логистическая регрессия</b> — классификация: "дорогой" или "дешёвый" авто по заданному порогу.</li>
                    <li><b>Машинное обучение</b> — прогноз цены в будущем или обучение по эпохам с оценкой ошибок (MSE, R²).</li>
                </ul>

                <h4 className="mt-5">💾 Удобство работы</h4>
                <p>
                    Система автоматически сохраняет анализы (кроме линейной регрессии) в базу данных. Вы также можете вручную экспортировать
                    или скачать исходные данные.
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default About;
