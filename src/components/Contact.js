import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const Contact = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setErrorMessage("Пожалуйста, заполните все поля.");
            return;
        }

        try {
            const token = currentUser.token;
            const userId = currentUser.id;

            const response = await axios.post(
                `http://localhost:8080/api/tickets?userId=${userId}`,
                { title, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage("Заявка успешно отправлена!");
            setTitle("");
            setDescription("");
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage("Ошибка при отправке заявки. Попробуйте позже.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body">
                            <h4 className="card-title mb-4 text-primary text-center">Форма заявки на добавление данных об авто</h4>

                            {successMessage && (
                                <div className="alert alert-success">{successMessage}</div>
                            )}
                            {errorMessage && (
                                <div className="alert alert-danger">{errorMessage}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Заголовок заявки</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Например: Добавить данные о Toyota Corolla"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Описание</label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Укажите подробности: год выпуска, тип топлива, трансмиссия и т.д."
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Отправить заявку
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;