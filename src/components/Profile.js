import React from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../actions/auth"; // путь обновлён на actions/auth

const Profile = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

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

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg">
                        <div className="card-body text-center">
                            <img
                                src="https://i.ibb.co/KcsghQg8/speaker-azzurro-1.png"
                                alt="Профиль"
                                className="img-fluid mb-4"
                                style={{ maxHeight: "180px" }}
                            />
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
                            <button className="btn btn-danger mt-4" onClick={handleLogout}>
                                Выйти из аккаунта
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;