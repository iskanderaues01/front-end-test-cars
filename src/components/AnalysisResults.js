// AnalysisResults.js
import React from "react";

const AnalysisResults = ({ method, results }) => {
    switch (method) {
        case "linear_regression":
            return (
                <>
                    {results.Equation && <p><b>Уравнение:</b> {results.Equation}</p>}
                    {results.MSE !== undefined && <p><b>MSE:</b> {results.MSE}</p>}
                    {results["R^2"] !== undefined && <p><b>R²:</b> {results["R^2"]}</p>}
                    {results.DummyFeatures && (
                        <>
                            <p><b>Dummy-переменные:</b></p>
                            <ul>
                                {results.DummyFeatures.map((feat, idx) => (
                                    <li key={idx}>{feat}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            );
        case "logistic_regression":
            return (
                <>
                    <p><b>Метод:</b> Логистическая регрессия</p>
                    {results.Accuracy && <p><b>Точность модели:</b> {results.Accuracy}</p>}
                    {results.ConfusionMatrix && (
                        <>
                            <p><b>Матрица ошибок:</b></p>
                            <pre>{results.ConfusionMatrix}</pre>
                        </>
                    )}
                </>
            );
        case "machine_learning":
            return (
                <>
                    <p><b>Метод:</b> Машинное обучение</p>
                    {results.FeatureImportance && (
                        <>
                            <p><b>Важность признаков:</b></p>
                            <ul>
                                {Object.entries(results.FeatureImportance).map(([feature, importance]) => (
                                    <li key={feature}>{feature}: {importance}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            );
        default:
            return (
                <div style={{ color: "red" }}>
                    <p>Неизвестный метод анализа: {method}</p>
                </div>
            );
    }
};

export default AnalysisResults;
