import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import UserService from "../services/user.service";
import Footer from "./Footer";

const Home = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    UserService.getPublicContent().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(_content);
      }
    );
  }, []);

  return (
      <div className="container">
        <header className="jumbotron">
          <div className="container-center">
            <img
                src="https://i.ibb.co/M65W8pF/logo-car-metrics.png"
                alt="logo-img"
                className="home-content-image"
            />
          </div>
          <h3 className="text-center">Статистика в реальном времени</h3>
        </header>
        <div id="carouselExampleCaptions" className="carousel slide" data-ride="carousel">
          <ol className="carousel-indicators">
            <li data-target="#carouselExampleCaptions" data-slide-to="0" className="active"></li>
            <li data-target="#carouselExampleCaptions" data-slide-to="1"></li>
            <li data-target="#carouselExampleCaptions" data-slide-to="2"></li>
          </ol>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="https://i.ibb.co/K9V77CC/slide-1.jpg" className="d-block w-100" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5>Комплексный анализ цен</h5>
                <p>Получите ценную информацию с помощью подробного анализа тенденций ценообразования на автомобили в
                  Алматы.</p>
              </div>
            </div>
            <div className="carousel-item">
              <img src="https://i.ibb.co/FW9YsVd/slide-3.jpg" className="d-block w-100" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5>Индивидуальные отчеты о ценах</h5>
                <p>Получайте индивидуальные отчеты, соответствующие конкретным вашим потребностям</p>
              </div>
            </div>
            <div className="carousel-item">
              <img src="https://i.ibb.co/T2MFYnJ/slide-2.jpg" className="d-block w-100" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5>Отслеживание истории цен</h5>
                <p>Получайте доступ к историческим данным, чтобы отслеживать изменения цен и увидеть прогнозирование
                  будущих тенденций.</p>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-target="#carouselExampleCaptions"
                  data-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="sr-only">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-target="#carouselExampleCaptions"
                  data-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="sr-only">Next</span>
          </button>
        </div>

        <style jsx>{`
          .carousel-caption h5, .carousel-caption p {
            color: white; /* Белый цвет текста */
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Тень для текста */
          }

          .carousel-control-prev-icon, .carousel-control-next-icon {
            background-color: rgba(0, 0, 0, 0.5); /* Полупрозрачный фон для стрелок */
          }

          .carousel-control-prev, .carousel-control-next {
            color: white; /* Белый цвет для стрелок */
          }

          .carousel-inner img {
            filter: brightness(70%); /* Уменьшаем яркость изображения для лучшего контраста текста */
          }
        `}</style>
        <Footer />
      </div>
  );
};

export default Home;
