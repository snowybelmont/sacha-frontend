import Router from "next/router";
import React, { useState } from "react";
import Fingerprint2 from "fingerprintjs2";
import { getCookie, setCookie } from "cookies-next";
import nProgress from "nprogress";
import Logo from "@/components/Logo";
import { DateTime } from "luxon";

function WriteCode({ token, finger }) {
  const [Disabled, setDisabled] = useState(false);
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

  const handleClick = async () => {
    nProgress.start();
    let errors = [];
    let warnings = [];

    document.getElementById("container-alerts").innerHTML = "";
    document.getElementById("submit").classList.add("disabled");
    setDisabled(true);

    if (event.target.id === "backi") {
      try {
        Router.push("/readqr");
      } catch (err) {
        console.log(err);
        setDisabled(false);
      }
    } else if (event.target.id === "submit") {
      try {
        if (getCookie("type") !== "aluno") {
          errors.push("Nenhum tipo definido. Recarregue a página!");
          throw new Error("Tipo indefinido");
        }

        if (!document.getElementById("wcode").value) {
          errors.push("Nenhum código identificado");
          throw new Error("Código invalido");
        }

        code = document.getElementById("wcode").value;

        const presenceObj = {
          token: token,
          code: code,
          fingerprint: finger,
        };

        const write = async () => {
          try {
            const URL = "https://projeto-sacha.onrender.com";

            const presence = await fetch(
              `${URL}/presences/single/ra?id=${token}&code=${code}`
            );

            const json = await presence.json();

            if (presence.status === 401) {
              const presenceDate = new Date(json.presence.date_create);
              const now = DateTime.local().setZone("America/Sao_Paulo");

              const periodOne =
                (presenceDate.getHours() === 19 &&
                  presenceDate.getMinutes() >= 0) ||
                (presenceDate.getHours() === 20 &&
                  presenceDate.getMinutes() <= 40);

              const nowPeriodOne =
                (now.hour === 19 && now.minute >= 0) ||
                (now.hour === 20 && now.minute <= 40);

              const periodTwo =
                (presenceDate.getHours() === 20 &&
                  presenceDate.getMinutes() >= 50) ||
                (presenceDate.getHours >= 21 &&
                  presenceDate.getMinutes() <= 59) ||
                (presenceDate.getHours() === 22 &&
                  presenceDate.getMinutes() <= 30);

              const nowPeriodTwo =
                (now.hour === 20 && now.minute >= 50) ||
                (now.hour > 20 && now.hour < 22) ||
                (now.hour === 22 && now.minute <= 30);

              if (
                now.hour < 19 ||
                (now.hour === 20 && now.minute > 40 && now.minute < 50) ||
                (now.hour === 22 && now.minute > 30) ||
                now.hour > 22
              ) {
                errors.push(
                  "Você tem que estar no horário  de aula para registrar a presença"
                );
                throw new Error("Não pode prosseguir");
              }

              if ((periodOne && nowPeriodOne) || (periodTwo && nowPeriodTwo)) {
                errors.push(
                  "Você já registrou sua presença nesse dispositivo hoje"
                );
                throw new Error("Não pode prosseguir");
              }
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

            setDisabled(false);
            nProgress.done();
          } catch (err) {
            console.log(err);
            if (errors.length > 0 || warnings.length > 0) {
              displayAlert(errors, warnings);

              if (errors[0] === "Nenhum tipo definido. Recarregue a página!") {
                nProgress.done();
                return;
              } else if (
                errors[0] ===
                "Você já registrou sua presença nesse dispositivo hoje"
              ) {
                setDisabled(false);
                nProgress.done();
                return;
              }
            }
            document.getElementById("submit").classList.remove("disabled");
            setDisabled(false);
            nProgress.done();
          }
        };

        write();
      } catch (err) {
        console.log(err);
        if (errors.length > 0 || warnings.length > 0) {
          displayAlert(errors, warnings);

          if (errors[0] === "Nenhum tipo definido. Recarregue a página!") {
            nProgress.done();
            return;
          } else if (
            errors[0] ===
            "Você já registrou sua presença nesse dispositivo hoje"
          ) {
            setDisabled(false);
            nProgress.done();
            return;
          }
        }
        document.getElementById("submit").classList.remove("disabled");
        setDisabled(false);
        nProgress.done();
      }
    }
  };

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div className="d-flex flex-column mb-3">
          <input
            id="wcode"
            className="form-control form-control-lg"
            type="text"
            placeholder="Digite o código do QR Code"
            aria-label="Digite o código do QR Code"
            disabled={Disabled}
          />
        </div>
        <button
          id="submit"
          className="red btn btn-primary btn-lg fw-bold me-3 mb-2 w-100"
          onClick={handleClick}
        >
          Enviar
        </button>
        <div className="d-flex text-center justify-content-center align-items-center">
          {Disabled ? (
            <i
              id="backi"
              className="bi bi-arrow-left-circle-fill red-text fs-1 disable-icon"
            ></i>
          ) : (
            <i
              id="backi"
              className="bi bi-arrow-left-circle-fill red-text fs-1 cursor"
              onClick={handleClick}
            ></i>
          )}
        </div>
        <div id="container-alerts"></div>
      </div>
    </div>
  );
}

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
        props: { token, finger },
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
    props: { token, finger },
  };
};

export default WriteCode;
