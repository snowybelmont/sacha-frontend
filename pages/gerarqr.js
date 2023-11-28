import Router from "next/router";
import { useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import Logo from "@/components/Logo";

function GerarQRCode({ initialQr, initialCode }) {
  const [Disabled, setDisabled] = useState(false);
  const [qr, setQR] = useState(initialQr);
  const [code, setCode] = useState(initialCode);

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

    setDisabled(true);
    document.getElementById("container-alerts").innerHTML = "";

    if (event.target.id === "home") {
      try {
        Router.push("/menu");
      } catch (err) {
        console.log(err);
        setDisabled(false);
      }
    } else if (event.target.id === "refresh") {
      const qrGen = async () => {
        try {
          const URL = "https://projeto-sacha.onrender.com";
          const response = await fetch(`${URL}/qrcode/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
          });

          if (!response.ok) {
            try {
              const URL = "https://projeto-sacha.onrender.com";
              const response = await fetch(`${URL}/users/single?id=${token}`);

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
          const newQR = await json.find.qrcode
            .replace(/\n/g, "")
            .replace(/\\/g, "");
          const newCode = await json.find.code;
          setQR(newQR);
          setCode(newCode);
          setDisabled(false);
        } catch (err) {
          console.log(err);
          if (errors.length > 0 || warnings.length > 0) {
            displayAlert(errors, warnings);
          }
          setDisabled(false);
        }
      };

      qrGen();
    }
  };

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div className="d-flex flex-column mb-3">
          <input
            className="form-control form-control-lg mb-3"
            type="text"
            placeholder="Não foi possível carregar o valor"
            value={code ?? "Não foi possível carregar o valor"}
            aria-label=".form-control-lg example"
            readOnly
          />
          {qr ? (
            <div dangerouslySetInnerHTML={{ __html: qr }} />
          ) : (
            <>
              <div id="container-alerts">
                <div
                  className="alert alert-danger text-start alert-dismissible"
                  role="alert"
                >
                  QR Code indisponível
                </div>
              </div>
            </>
          )}
        </div>
        <div className="d-flex text-center justify-content-center align-items-center">
          {Disabled ? (
            <i
              id="home"
              className="bi bi-house-door-fill red-text fs-1 me-4 disable-icon"
            ></i>
          ) : (
            <i
              id="home"
              className="bi bi-house-door-fill red-text fs-1 me-4 cursor"
              onClick={handleClick}
            ></i>
          )}
          {Disabled ? (
            <i
              id="refresh"
              className="bi bi-arrow-clockwise red-text mt-1 disable-icon"
            ></i>
          ) : (
            <i
              id="refresh"
              className="bi bi-arrow-clockwise red-text mt-1 cursor"
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
  const qrcode = getCookie("qrcode", { req, res });
  let initialQr = null;
  let initialCode = null;

  try {
    if (!qrcode) {
      return {
        redirect: {
          permanent: false,
          destination: "/login",
        },
        props: {},
      };
    }
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

      const searchQR = async () => {
        try {
          const URL = "https://projeto-sacha.onrender.com";
          const response = await fetch(`${URL}/qrcode/single?id=${qrcode}`);

          if (!response.ok) {
            return {
              props: {},
            };
          }

          const json = await response.json();
          initialQr = await json.qr.qrcode
            .replace(/\n/g, "")
            .replace(/\\/g, "");
          initialCode = await json.qr.code;

          return {
            props: { initialQr, initialCode },
          };
        } catch (err) {
          console.log(err);
          return;
        }
      };

      await searchQR();
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
    props: { initialQr, initialCode },
  };
};

export default GerarQRCode;
