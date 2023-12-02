import Router from "next/router";
import { useState, useEffect } from "react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import nProgress from "nprogress";
import Logo from "@/components/Logo";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function RollCall() {
  const [presences, setPresences] = useState([]);
  const [Disabled, setDisabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredPresences, setFilteredPresences] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [renderedItems, setRenderedItems] = useState([]);

  const fetchUserData = async (ra) => {
    try {
      const response = await fetch(
        `https://projeto-sacha.onrender.com/users/single/ra?ra=${ra}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.formattedData;
      } else {
        throw Error("Usuário não encontrado");
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const renderEstudantItems = async () => {
    const term = searchTerm.toLowerCase();

    const renderedItems = await Promise.all(
      filteredPresences.map(async (presence) => {
        const presenceDate = new Date(presence.date_create);
        const hours = presenceDate.getHours();
        const minutes = presenceDate.getMinutes();

        const userData = await fetchUserData(presence.estudant_RA);

        if (!userData) {
          return null;
        }

        const estudantName = userData.Nome.toLowerCase();

        if (
          (selectedPeriod === "Selecione um período" ||
            (selectedPeriod === "1º Período" &&
              (hours === 19 || (hours === 20 && minutes <= 40))) ||
            (selectedPeriod === "2º Período" &&
              hours === 20 &&
              minutes >= 50) ||
            (selectedPeriod === "2º Período" &&
              hours === 22 &&
              minutes <= 30)) &&
          estudantName.includes(term)
        ) {
          return (
            <EstudantItem
              key={`${presence.estudant_RA}_${formatDate(
                presence.date_create
              )}`}
              ra={presence.estudant_RA}
              classe={presence.class}
              userData={userData}
            />
          );
        }

        return null;
      })
    );

    setRenderedItems(renderedItems.filter((item) => item !== null));
  };

  useEffect(() => {
    renderEstudantItems();
  }, [filteredPresences, selectedPeriod, searchTerm]);

  const fetchPresences = async () => {
    try {
      const response = await fetch(
        "https://projeto-sacha.onrender.com/presences/all"
      );
      if (response.ok) {
        const data = await response.json();
        setPresences(data.presences);
        await renderEstudantItems();
      } else {
        console.error("Presença não encontrada");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPresences();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filteredPresences = presences.filter((presence) => {
        const presenceDate = new Date(presence.date_create);
        return (
          presenceDate.getDate() === selectedDate.getDate() &&
          presenceDate.getMonth() === selectedDate.getMonth() &&
          presenceDate.getFullYear() === selectedDate.getFullYear()
        );
      });

      setFilteredPresences(filteredPresences);

      const periodSelectElement = document.getElementById("periodSelect");

      const selectedPeriodValue = periodSelectElement
        ? periodSelectElement.value
        : "Selecione um período";

      const event = {
        target: {
          value: selectedPeriodValue,
        },
      };

      handlePeriodChange(event);
      renderEstudantItems();
    } else {
      setFilteredPresences(presences);

      const periodSelectElement = document.getElementById("periodSelect");

      const selectedPeriodValue = periodSelectElement
        ? periodSelectElement.value
        : "Selecione um período";

      const event = {
        target: {
          value: selectedPeriodValue,
        },
      };

      handlePeriodChange(event);
      renderEstudantItems();
    }
  }, [selectedDate, presences, selectedPeriod, searchTerm]);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    await renderEstudantItems();
  };

  const handlePeriodChange = async (event) => {
    setSelectedPeriod(event.target.value);
    await renderEstudantItems();
  };

  const handleInputChange = async (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    await renderEstudantItems();
  };

  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
  };

  const handleClick = (event) => {
    nProgress.start();

    setDisabled(true);

    if (event.target.id === "home") {
      try {
        nProgress.done();
        Router.push("/menu");
      } catch (err) {
        console.log(err);
        setDisabled(false);
      }
    }
  };

  if (presences.length < 1) {
    return (
      <div className="container py-4 text-center">
        <div className="container-fluid">
          <Logo />
          <div className="d-flex flex-column mb-3">
            <div
              className="alert alert-danger text-start alert-dismissible"
              role="alert"
            >
              Nenhuma presença encontrada
            </div>
          </div>
          <div className="d-flex text-center justify-content-center align-items-center">
            {Disabled ? (
              <i
                id="home"
                className="bi bi-house-door-fill red-text fs-1 disable-icon"
              ></i>
            ) : (
              <i
                id="home"
                className="bi bi-house-door-fill red-text fs-1 cursor"
                onClick={handleClick}
              ></i>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div className="d-flex flex-column justify-content align-items-center mb-3">
          <div className="d-flex flex-column flex-md-row">
            <div className="mb-3 mb-md-0">
              <DatePicker
                className="form-select form-select-lg w-100"
                placeholderText="Selecione uma data"
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="mb-3 ms-md-3">
              <select
                id="periodSelect"
                className="form-select form-select-lg w-100"
                aria-label="Large select example"
                onChange={handlePeriodChange}
              >
                <option defaultValue="0" selected>
                  Selecione um período
                </option>
                <option defaultValue="1">1º Período</option>
                <option defaultValue="2">2º Período</option>
              </select>
            </div>
          </div>
          <div className="input-group mb-3">
            <div className="form-floating">
              <input
                type="text"
                className="form-control w-100"
                id="floatingInputGroup1"
                placeholder="Procurar um aluno"
                value={searchTerm}
                onChange={handleInputChange}
              />
              <label htmlFor="floatingInputGroup1">Procurar um aluno</label>
            </div>
            <span className="input-group-text">
              <i className="bi bi-search fw-bold red-text"></i>
            </span>
          </div>
          <div id="list" className="list-group">
            {renderedItems}
          </div>
          <div className="d-flex text-center justify-content-center align-items-center">
            {Disabled ? (
              <i
                id="home"
                className="bi bi-house-door-fill red-text fs-1 disable-icon"
              ></i>
            ) : (
              <i
                id="home"
                className="bi bi-house-door-fill red-text fs-1 cursor"
                onClick={handleClick}
              ></i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EstudantItem({ ra, classe }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `https://projeto-sacha.onrender.com/users/single/ra?ra=${ra}`
        );
        if (response.ok) {
          const data = await response.json();
          setUserData(data.formattedData);
        } else {
          throw Error("Usuário não encontrado");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, [ra]);

  if (!userData) {
    return null;
  }

  return (
    <a
      className="list-group-item list-group-item-action bg"
      aria-current="true"
    >
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
        <img
          src={userData.Foto}
          className="rounded me-3 mb-3 mb-md-0"
          width={100}
          height={100}
          alt={"Foto do Estudante"}
        />
        <div className="">
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">{userData.Nome}</h5>
          </div>
          <div className="d-flex flex-column flex-md-row justify-content-evenly align-items-center">
            <small>{classe ?? "Sem disciplina"}</small>
            <small>|</small>
            <small>{userData.Periodo}</small>
          </div>
        </div>
      </div>
    </a>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const type = getCookie("type", { req, res });
  const token = getCookie("token", { req, res });

  try {
    if (token) {
      const URL = "https://projeto-sacha.onrender.com";
      const response = await fetch(`${URL}/users/single?id=${token}`);

      if (!response.ok) {
        throw new Error("Usuário não encontrado");
      }

      const json = await response.json();

      if (
        (type !== "aluno" && type !== "professor") ||
        type !== json.formattedData.Tipo
      ) {
        setCookie("type", json.formattedData.Tipo, { req, res });
      }

      if (json.formattedData.Tipo !== "professor") {
        throw new Error("Não é professor");
      }

      return {
        props: {},
      };
    } else {
      throw new Error("Usário não encontrado");
    }
  } catch (err) {
    console.log(err);
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default RollCall;
