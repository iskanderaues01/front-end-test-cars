import React from "react";

const HomeTab = () => {
    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <img
                            src="https://i.ibb.co/dwWxgQxC/diagram-admin.webp"
                            alt="Диаграмма аналитики"
                            className="img-fluid rounded"
                            style={{ maxHeight: "300px", objectFit: "cover" }}
                        />
                    </div>
                    <h1 className="card-title text-primary mb-4 text-center">
                        Добро пожаловать в панель работы со статистикой!
                    </h1>
                    <p className="card-text text-center">
                        Данная панель предназначена для удобной работы с данными о транспортных средствах,
                        анализа тенденций рынка и получения прогностической информации.
                    </p>
                    <hr />
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <h5 className="text-secondary">Возможности панели статистики:</h5>
                            <ul>
                                <li>Анализ рыночных данных о транспортных средствах</li>
                                <li>Прогнозирование цен с помощью машинного обучения</li>
                                <li>Визуализация ключевых метрик и трендов</li>
                                <li>Сравнительный анализ моделей и марок</li>
                                <li>Фильтрация и выгрузка статистических отчётов</li>
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <h5 className="text-secondary">Навигация:</h5>
                            <ul>
                                <li><strong>Каталог данных о машинах</strong> — доступ к исходным данным</li>
                                <li><strong>История статистики</strong> — сохранённые результаты анализа</li>
                                <li><strong>Анализ данных</strong> — запуск нового анализа</li>
                            </ul>
                        </div>
                    </div>
                    <div className="alert alert-info mt-4" role="alert">
                        Все данные обрабатываются локально. Безопасность и конфиденциальность гарантированы.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;