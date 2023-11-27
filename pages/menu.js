import Router from "next/router";
import { useState } from "react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import Logo from "@/components/Logo";

function Menu({ returnType }) {
  const [TypeViewTeacher, setTypeViewTeacher] = useState(returnType);

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
    const token = getCookie("token");
    let errors = [];
    let warnings = [];

    document.getElementById("container-alerts").innerHTML = "";
    document.getElementById(event.target.id).classList.add("disabled");

    if (event.target.id === "generateQR") {
      const qrGen = async () => {
        try {
          const URL = "http://localhost:3001/qrcode";
          const response = await fetch(`${URL}/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
          });

          if (!response.ok) {
            try {
              const URL = "http://localhost:3001/users";
              const response = await fetch(`${URL}/single?id=${token}`);

              if (!response.ok) {
                throw new Error("Usuário não encontrado");
              }
            } catch (err) {
              console.log(err);
              errors.push("Usuário não encontrado");
              Router.push("/login");
              return;
            }

            errors.push("Erro ao gerar o QR Code");
          }

          if (errors.length > 0 || warnings.length > 0) {
            throw new Error("Não pode prosseguir");
          }

          const json = await response.json();
          setCookie("qrcode", json.find._id);
          Router.push("/gerarqr");
        } catch (err) {
          console.log(err);
          if (errors.length > 0 || warnings.length > 0) {
            displayAlert(errors, warnings);
          }
          document.getElementById("generateQR").classList.remove("disabled");
        }
      };

      qrGen();
    } else if (event.target.id === "readQR") {
      try {
        document.getElementById(event.target.id).classList.add("disabled");
        Router.push("/readqr");
      } catch (err) {
        console.log(err);
        document.getElementById("readQR").classList.add("disabled");
      }
    }
  };
  return (
    <>
      {TypeViewTeacher ? (
        <div className="container py-4 text-center">
          <div className="container-fluid">
            <Logo />
            <div className="d-flex flex-column mb-3">
              <div className="d-flex text-center justify-content-center mb-3">
                <button
                  id="generateQR"
                  className="red btn btn-primary btn-lg fw-bold me-3 w-100"
                  onClick={handleClick}
                >
                  Gerar QR Code
                </button>
                <button
                  id="rollCall"
                  className="red btn btn-primary btn-lg fw-bold w-100"
                  onClick={handleClick}
                  disabled={true}
                >
                  Lista de Chamada
                </button>
              </div>
              <div className="d-flex text-center justify-content-center">
                <button
                  id="analysis"
                  className="red btn btn-primary btn-lg fw-bold me-3 w-100"
                  onClick={handleClick}
                  disabled={true}
                >
                  Análise
                </button>
                <button
                  id="calendar"
                  className="red btn btn-primary btn-lg fw-bold w-100"
                  onClick={handleClick}
                  disabled={true}
                >
                  Calendário
                </button>
              </div>
            </div>
            <div id="container-alerts"></div>
          </div>
        </div>
      ) : (
        <div className="container py-4 text-center">
          <div className="container-fluid">
            <Logo />
            <div className="d-flex flex-column mb-3">
              <div className="d-flex text-center justify-content-center mb-3">
                <button
                  id="readQR"
                  className="red btn btn-primary btn-lg fw-bold me-3 w-100"
                  onClick={handleClick}
                >
                  Ler QR Code
                </button>
                <button
                  id="grades"
                  className="red btn btn-primary btn-lg fw-bold w-100"
                  onClick={handleClick}
                  disabled={true}
                >
                  Notas
                </button>
              </div>
              <div className="d-flex text-center justify-content-center">
                <button
                  id="absences"
                  className="red btn btn-primary btn-lg fw-bold me-3 w-100"
                  onClick={handleClick}
                  disabled={true}
                >
                  Faltas
                </button>
                <button
                  id="calendar"
                  className="red btn btn-primary btn-lg fw-bold w-100"
                  onClick={handleClick}
                  disabled={true}
                >
                  Calendário
                </button>
              </div>
            </div>
            <div id="container-alerts"></div>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async ({ req, res }) => {
  const type = getCookie("type", { req, res });
  const token = getCookie("token", { req, res });
  let returnType;

  try {
    if (token) {
      const URL = process.env.URL ?? "http://localhost:3001";
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

      if (json.formattedData.Tipo === "aluno") {
        returnType = false;
      } else if (json.formattedData.Tipo === "professor") {
        returnType = true;
      }

      return {
        props: {
          returnType,
        },
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
    props: { returnType },
  };
};

export default Menu;
