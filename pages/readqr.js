import React, { useState } from "react";
import Router from "next/router";
import dynamic from "next/dynamic";
import { getCookie, setCookie } from "cookies-next";
import Logo from "@/components/Logo";

const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false });

const ReadQRCode = () => {
  const [result, setResult] = useState();
  const [Disabled, setDisabled] = useState(false);

  const handleScan = (data) => {
    if (data) {
      setResult(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const displayAlert = (errors, warnings) => {
    const container = document.getElementById("container-alerts");
    let i = 0;

    if (errors.length > 0) {
      if (errors[0] === "Nenhum tipo definido. Recarregue a página!") {
        for (i; i <= errors.length - 1; i++) {
          container.innerHTML += `<div class="alert alert-danger text-start alert-dismissible" role="alert">
          ${errors[i]}
          </div>`;
        }
      } else {
        for (i; i <= errors.length - 1; i++) {
          container.innerHTML += `<div class="alert alert-danger text-start alert-dismissible" role="alert">
          ${errors[i]}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
        }
      }
    }

    if (warnings.length > 0) {
      for (i; i <= warnings.length - 1; i++) {
        container.innerHTML += `<div class="alert alert-warning text-start alert-dismissible" role="alert">
          ${warnings[i]}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
      }
    }
  };

  const handleClick = (event) => {
    let errors = [];
    let warnings = [];

    setDisabled(true);
    document.getElementById("container-alerts").innerHTML = "";

    if (event.target.id === "home") {
      try {
        Router.push("/menu");
      } catch (err) {
        console.log(err);
        setDisabled(false);
      }
    }
  };

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div
          className="d-flex flex-column mb-3"
          style={{
            width: "300px",
            height: "300px",
            aspectRatio: "1/1",
          }}
        >
          <QrScanner
            className="mb-3"
            onScan={handleScan}
            onError={handleError}
            style={{ width: "100%" }}
            facingMode="environment"
          />
          <p>Resultado: {result}</p>
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
        <div id="container-alerts"></div>
      </div>
    </div>
  );
};

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
    } else {
      throw new Error("Usário não encontrado");
    }
  } catch (err) {
    console.log(err);
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }

  return {
    props: {},
  };
};

export default ReadQRCode;
