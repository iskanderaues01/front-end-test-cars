import React from "react";
import { Navigate } from 'react-router-dom';
import { useSelector } from "react-redux";

const Profile = () => {
    const { user: currentUser } = useSelector((state) => state.auth);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Role translation function
    const translateRole = (role) => {
        switch (role) {
            case "ROLE_USER":
                return "Пользователь";
            case "ROLE_ADMIN":
                return "Администратор";
            case "ROLE_MODERATOR":
                return "Модератор";
            default:
                return role; // Return the original role if no match is found
        }
    };

    return (
        <div className="container">
            <header className="jumbotron">
                <h3>
                    <strong>{currentUser.username}</strong> Профиль
                </h3>
            </header>
            <p>
                <strong>Токен авторизации:</strong> {currentUser.token.substring(0, 20)} ...{" "}
                {currentUser.token.substr(currentUser.token.length - 20)}
            </p>
            <p>
                <strong>Тип токена:</strong> {currentUser.tokenType}
            </p>
            <p>
                <strong>Id:</strong> {currentUser.id}
            </p>
            <p>
                <strong>Email:</strong> {currentUser.email}
            </p>
            <strong>Роль:</strong>
            <ul>
                {currentUser.roles &&
                    currentUser.roles.map((role, index) => (
                        <li key={index}>{translateRole(role)}</li>
                    ))}
            </ul>
        </div>
    );
};

export default Profile;

