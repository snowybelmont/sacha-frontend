import React, { useState } from "react";
import Router from "next/router";
import Fingerprint2 from "fingerprintjs2";
import { getCookie, setCookie } from "cookies-next";
import Logo from "@/components/Logo";
import nProgress from "nprogress";
import QRCodeScanner from "@/components/ReadQR";

const ReadQRCode = ({ token, finger }) => {
  const [Disabled, setDisabled] = useState(false);
  const [CameraReady, setCameraReady] = useState(true);
  const [CameraRead, setCameraRead] = useState(false);
  let code;

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

  const handleScan = (result) => {
    console.log("QR Code lido:", result.data);

    return (code = result.data);
  };

  const handleClick = (event) => {
    nProgress.start();
    let errors = [];
    let warnings = [];

    document.getElementById("container-alerts").innerHTML = "";
    document.getElementById("writeCode").classList.add("disabled");
    document.getElementById("confirm").classList.add("disabled");
    setDisabled(true);
    setCameraRead(true);

    if (event.target.id === "home") {
      try {
        Router.push("/menu");
      } catch (err) {
        console.log(err);
        setDisabled(false);
      }
    } else if (event.target.id === "writeCode") {
      try {
        Router.push("/writecode");
      } catch (err) {
        console.log(err);
        setDisabled(false);
      }
    } else if (event.target.id === "confirm") {
      try {
        if (getCookie("type") !== "aluno") {
          errors.push("Nenhum tipo definido. Recarregue a página!");
          setCameraRead(false);
          setCameraReady(false);
          throw new Error("Tipo indefinido");
        }

        if (!code) {
          errors.push("Nenhum código identificado");
          throw new Error("Código invalido");
        }

        const presenceObj = {
          token: token,
          code: code,
          fingerprint: finger,
        };

        const read = async () => {
          try {
            const URL = "https://projeto-sacha.onrender.com";

            const presence = await fetch(
              `${URL}/presences/single/ra?id=${token}&code=${code}`
            );

            if (presence.status === 401) {
              errors.push(
                "Você já registrou sua presença nesse dispositivo hoje"
              );
              setCameraRead(false);
              throw new Error("Não pode prosseguir");
            } else if (presence.status !== 200) {
              errors.push("Error ao registrar presença");
              throw new Error("Não pode prosseguir");
            }

            const response = await fetch(`${URL}/presences/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(presenceObj),
            });

            if (!response.ok) {
              errors.push("Erro ao registrar a presença");
            }

            if (errors.length > 0 || warnings.length > 0) {
              throw new Error("Não pode prosseguir");
            }

            const jsonResponse = await response.json();
            if (jsonResponse.message === "Presença Registrada") {
              const container = document.getElementById("container-alerts");
              container.innerHTML += `<div class="alert alert-success text-start alert-dismissible" role="alert">
              Sua presença foi registrada no sistema
          </div>`;
            }

            setCameraRead(false);
            setDisabled(false);
            nProgress.done();
          } catch (err) {
            console.log(err);
            if (errors.length > 0 || warnings.length > 0) {
              displayAlert(errors, warnings);

              if (
                errors[0] === "Nenhum tipo definido. Recarregue a página!" ||
                errors[0] === "Permissão de Geolocalização não encontrada!"
              ) {
                nProgress.done();
                return;
              } else if (
                errors[0] ===
                "Você já registrou sua presença nesse dispositivo hoje"
              ) {
                setDisabled(false);
                nProgress.done();
                return;
              } else if (
                errors[0] ===
                "Nenhuma câmera disponível, utilize o código para registrar sua presença"
              ) {
                document
                  .getElementById("writeCode")
                  .classList.remove("disabled");
                setDisabled(false);
                nProgress.done();
                return;
              }
            }
            document.getElementById("confirm").classList.remove("disabled");
            document.getElementById("writeCode").classList.remove("disabled");
            setCameraRead(false);
            setDisabled(false);
            nProgress.done();
          }
        };

        read();
      } catch (err) {
        console.log(err);
        setCameraRead(false);
        if (errors.length > 0 || warnings.length > 0) {
          displayAlert(errors, warnings);

          if (
            errors[0] === "Nenhum tipo definido. Recarregue a página!" ||
            errors[0] === "Permissão de Geolocalização não encontrada!"
          ) {
            nProgress.done();
            return;
          } else if (
            errors[0] ===
            "Você já registrou sua presença nesse dispositivo hoje"
          ) {
            setDisabled(false);
            nProgress.done();
            return;
          } else if (
            errors[0] ===
            "Nenhuma câmera disponível, utilize o código para registrar sua presença"
          ) {
            document.getElementById("writeCode").classList.remove("disabled");
            setDisabled(false);
            nProgress.done();
            return;
          }
        }
        document.getElementById("confirm").classList.remove("disabled");
        document.getElementById("writeCode").classList.remove("disabled");
        setDisabled(false);
        nProgress.done();
      }
    }
  };

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div id="container-alerts"></div>
        <div className="d-flex flex-column text-center justify-content-center align-items-center mb-2">
          {CameraReady ? (
            <>
              {CameraRead ? (
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              ) : (
                <QRCodeScanner onScan={handleScan} />
              )}
            </>
          ) : (
            <div id="container-alerts">
              <div
                className="alert alert-danger text-start alert-dismissible"
                role="alert"
              >
                Câmera indisponível
              </div>
            </div>
          )}
          <button
            id="confirm"
            className="red btn btn-primary btn-lg fw-bold mt-3 w-100"
            onClick={handleClick}
          >
            Confirmar
          </button>
          <button
            id="writeCode"
            className="red btn btn-primary btn-lg fw-bold mt-3 mb-2 w-100"
            onClick={handleClick}
          >
            Digitar Código
          </button>
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
};

export const getServerSideProps = async ({ req, res }) => {
  const type = getCookie("type", { req, res });
  const token = getCookie("token", { req, res });

  try {
    let finger = null;
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

      if (json.formattedData.Tipo !== "aluno") {
        throw new Error("Não é aluno");
      }

      const getFingerprint = async () => {
        return new Promise((resolve, reject) => {
          Fingerprint2.get({}, (components) => {
            const values = components.map((component) => component.value);
            const fingerprint = Fingerprint2.x64hash128(values.join(""), 31);
            resolve(fingerprint);
          });
        });
      };

      finger = await getFingerprint();

      return {
        props: { finger, token },
      };
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
    props: { finger, token },
  };
};

export default ReadQRCode;
