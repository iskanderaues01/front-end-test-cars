// Footer.js
import React from "react";

const Footer = () => {
    return (
        <footer className="bg-light text-center text-lg-start mt-auto">
            <div className="text-center p-3">
                <img
                    src="https://i.ibb.co/ZR1GP9cS/Daukeyev-05.png"
                    alt="footer-logo"
                    className="mb-2"
                    style={{ width: "100px" }}
                />
                <h5>Car Metrics</h5>
                <p>
                    Все права защищены &copy; {new Date().getFullYear()}.
                </p>
                <p>Авторы: Көкенали И. Е.</p>
            </div>
        </footer>
    );
};

export default Footer;
