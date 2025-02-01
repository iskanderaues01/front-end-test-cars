import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import BoardUser from "./components/BoardUser";
import BoardModerator from "./components/BoardModerator";
import BoardAdmin from "./components/BoardAdmin";
import Statistic from "./components/Statistic";

import { logout } from "./actions/auth";
import { clearMessage } from "./actions/message";

// import AuthVerify from "./common/AuthVerify";
import EventBus from "./common/EventBus";

const App = () => {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  let location = useLocation();

  const noContainerPaths = ["/mod", "/admin", "/statistic"];

  const isNoContainerPath = noContainerPaths.includes(location.pathname);

  useEffect(() => {
    if (["/login", "/register"].includes(location.pathname)) {
      dispatch(clearMessage()); // clear message when changing location
    }
  }, [dispatch, location]);

  const logOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setShowModeratorBoard(currentUser.roles.includes("ROLE_MODERATOR"));
      setShowAdminBoard(currentUser.roles.includes("ROLE_ADMIN"));
    } else {
      setShowModeratorBoard(false);
      setShowAdminBoard(false);
    }

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, [currentUser, logOut]);

  return (
      <div className="d-flex flex-column min-vh-100">
        <nav className="navbar navbar-expand navbar-light bg-light">
          <Link to={"/"} className="navbar-brand">
            <img
                src="https://i.ibb.co/MZ4KR34/logo-least.png"
                alt="logo-brand"
                className="logo-brand"
            />
          </Link>
          <Link to={"/"} className="navbar-brand">
            Car Metrics
          </Link>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Главная
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/about"} className="nav-link">
                О нас
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/contact"} className="nav-link">
                Связаться
              </Link>
            </li>
            <li className="nav-item">
              <Link to={"/statistic"} className="nav-link">
                Статистика
              </Link>
            </li>

            {showModeratorBoard && (
                <li className="nav-item">
                  <Link to={"/mod"} className="nav-link">
                    Панель модератора
                  </Link>
                </li>
            )}

            {showAdminBoard && (
                <li className="nav-item">
                  <Link to={"/admin"} className="nav-link">
                    Панель администратора
                  </Link>
                </li>
            )}
          </div>

          {currentUser ? (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/profile"} className="nav-link">
                    {currentUser.email}
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="/login" className="nav-link" onClick={logOut}>
                    Выйти
                  </a>
                </li>
              </div>
          ) : (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/login"} className="nav-link">
                    Войти
                  </Link>
                </li>

                <li className="nav-item">
                  <Link to={"/register"} className="nav-link">
                    Регистрация
                  </Link>
                </li>
              </div>
          )}
        </nav>

        <>
          {isNoContainerPath ? (
              <div className="mt-3">
                <Routes>
                  <Route path="/mod" element={<BoardModerator/>}/>
                  <Route path="/admin" element={<BoardAdmin/>}/>
                  <Route path="/statistic" element={<Statistic />} />
                </Routes>
              </div>
          ) : (
              <div className="container mt-3 flex-grow-1">
                <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="/home" element={<Home/>}/>
                  <Route path="/login" element={<Login/>}/>
                  <Route path="/register" element={<Register/>}/>
                  <Route path="/profile" element={<Profile/>}/>
                  <Route path="/user" element={<BoardUser/>}/>
                </Routes>
              </div>
          )}
        </>

        {/* <AuthVerify logOut={logOut}/> */}
      </div>
  );
};

export default App;
