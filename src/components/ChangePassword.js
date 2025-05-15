import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../actions/auth";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Это поле обязательно для заполнения!
            </div>
        );
    }
};

const ChangePassword = () => {
    const form = useRef();
    const checkBtn = useRef();

    const [username, setUsername] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [successful, setSuccessful] = useState(false);

    const dispatch = useDispatch();
    const { message } = useSelector(state => state.message);

    const handleChangePassword = (e) => {
        e.preventDefault();

        setSuccessful(false);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            dispatch(changePassword(username, oldPassword, newPassword))
                .then(() => {
                    setSuccessful(true);
                })
                .catch(() => {
                    setSuccessful(false);
                });
        }
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <img
                    src="https://i.ibb.co/CByM2Kf/logog.png"
                    alt="logo-img"
                    className="logo-small-img"
                />

                <Form onSubmit={handleChangePassword} ref={form}>
                    {!successful && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="username">Имя пользователя</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    validations={[required]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="oldPassword">Старый пароль</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="oldPassword"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    validations={[required]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Новый пароль</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    validations={[required]}
                                />
                            </div>

                            <div className="form-group mt-3">
                                <button className="btn btn-primary btn-block">
                                    Сменить пароль
                                </button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="form-group mt-3">
                            <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={checkBtn} />
                </Form>
            </div>
        </div>
    );
};

export default ChangePassword;
