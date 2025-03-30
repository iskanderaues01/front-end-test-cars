import React, { useState } from "react";
import HomeTab from "../tabs/HomeTab";
import CarsTab from "../tabs/CarsTab";
import HistoryTab from "../tabs/HistoryTab";
import AnalysisTab from "../tabs/AnalysisTab";

const Statistic = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [analysisFile, setAnalysisFile] = useState(null);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Функция для выбора файла из вкладки "Данные о машинах" и перехода к анализу
    const handleSetAnalysisFile = (fileObj) => {
        setAnalysisFile(fileObj);
        setActiveTab("analysis-scope");
    };

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
                        <span className="nav-link curs-pointer">Каталог данных о машинах</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${activeTab === "history-statistic-cars" ? "bg-primary text-white" : ""}`}
                        onClick={() => handleTabChange("history-statistic-cars")}
                    >
                        <span className="nav-link curs-pointer">История статистики</span>
                    </li>
                    <li
                        className={`nav-item p-2 ${activeTab === "analysis-scope" ? "bg-primary text-white" : ""}`}
                        onClick={() => handleTabChange("analysis-scope")}
                    >
                        <span className="nav-link curs-pointer">Анализ данных</span>
                    </li>
                </ul>
            </div>

            {/* Основной контент */}
            <div className="col-10 p-4">
                {activeTab === "home" && <HomeTab />}
                {activeTab === "cars" && <CarsTab handleSetAnalysisFile={handleSetAnalysisFile} />}
                {activeTab === "history-statistic-cars" && <HistoryTab />}
                {activeTab === "analysis-scope" && <AnalysisTab analysisFile={analysisFile} />}
            </div>
        </div>
    );
};

export default Statistic;
