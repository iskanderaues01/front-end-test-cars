import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../actions/auth";
import axios from "axios";

const Profile = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [avatarBase64, setAvatarBase64] = useState(""); // аватарка
    const [selectedFile, setSelectedFile] = useState(null); // выбранное изображение
    const [preview, setPreview] = useState(""); // предпросмотр

    useEffect(() => {
        if (currentUser) {
            fetchAvatar();
        }
    }, [currentUser]);

    const fetchAvatar = async () => {
        try {
            const token = JSON.parse(localStorage.getItem("user"))?.token;
            const response = await axios.get("http://localhost:8089/api/auth/avatar", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data?.avatarBase64) {
                setAvatarBase64(response.data.avatarBase64);
            }
        } catch (error) {
            console.error("Ошибка загрузки аватара:", error);
        }
    };

    const translateRole = (role) => {
        switch (role) {
            case "ROLE_USER":
                return "Пользователь";
            case "ROLE_ADMIN":
                return "Администратор";
            case "ROLE_MODERATOR":
                return "Модератор";
            default:
                return role;
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Предпросмотр
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile) {
            alert("Выберите изображение для загрузки.");
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                const token = JSON.parse(localStorage.getItem("user"))?.token;

                await axios.post(
                    "http://localhost:8089/api/auth/update-avatar",
                    {
                        username: currentUser.username,
                        avatarBase64: base64String,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                alert("Аватар успешно обновлён!");
                setAvatarBase64(base64String);
                setSelectedFile(null);
                setPreview("");
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error("Ошибка загрузки аватара:", error);
            alert("Ошибка загрузки аватара.");
        }
    };

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg">
                        <div className="card-body text-center">
                            <img
                                src={avatarBase64 || "https://i.ibb.co/KcsghQg8/speaker-azzurro-1.png"}
                                alt="Профиль"
                                className="img-fluid mb-4"
                                style={{maxHeight: "180px", borderRadius: "50%", objectFit: "cover"}}
                            />
                            <div className="mt-3">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => document.getElementById('avatarUploadInput').click()}
                                >
                                    Изменить аватар
                                </button>
                                <input
                                    id="avatarUploadInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{display: "none"}}
                                />
                            </div>

                            <h3 className="mb-3 text-primary">
                                Профиль пользователя: <strong>{currentUser.username}</strong>
                            </h3>
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>ID пользователя:</strong> {currentUser.id}</p>
                            <div className="mt-3">
                                <strong>Роли:</strong>
                                <ul className="list-unstyled">
                                    {currentUser.roles &&
                                        currentUser.roles.map((role, index) => (
                                            <li key={index} className="badge bg-secondary m-1">
                                                {translateRole(role)}
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            <div className="mt-4">
                                {preview && (
                                    <div className="mt-3">
                                        <h5>Обновление аватара</h5>
                                        <p>Предпросмотр:</p>
                                        <img
                                            src={preview}
                                            alt="Предпросмотр"
                                            style={{maxHeight: "150px", borderRadius: "50%", objectFit: "cover"}}
                                            className="mb-2"
                                        />
                                    </div>
                                )}
                                {selectedFile && (
                                    <button className="btn btn-success mt-2" onClick={handleUploadAvatar}>
                                        Сохранить аватар
                                    </button>
                                )}
                            </div>

                            <button className="btn btn-danger mt-4" onClick={handleLogout}>
                                Выйти из аккаунта
                            </button>

                            <div className="text-center mt-3">
                <span
                    style={{textDecoration: "underline", color: "blue", cursor: "pointer"}}
                    onClick={() => navigate("/change-password")}
                >
                  Сменить пароль
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
