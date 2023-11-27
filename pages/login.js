import Router from "next/router";
import { useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import Logo from "@/components/Logo";

function Login() {
  const [FormData, setFormData] = useState({
    email: "",
    password: "",
    type: getCookie("type"),
  });
  const [Disable, setDisable] = useState(false);

  const updateValue = () => {
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    setFormData({
      ...FormData,
      email: `${emailField.value}@fatec.sp.gov.br`,
      password: passwordField.value,
    });
  };

  const changePasswordVisibility = () => {
    const passwordField = document.getElementById("password");
    const icon = document.getElementById("eye");

    if (passwordField.type === "password") {
      passwordField.setAttribute("type", "text");
      icon.classList.replace("bi-eye-fill", "bi-eye-slash-fill");
    } else {
      passwordField.setAttribute("type", "password");
      icon.classList.replace("bi-eye-slash-fill", "bi-eye-fill");
    }
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

    try {
      document.getElementById("container-alerts").innerHTML = "";
      document.getElementById("back").classList.add("disabled");
      document.getElementById("submit").classList.add("disabled");

      if (event.target.id === "back") {
        Router.push("/");
        return;
      }

      updateValue();
      const emailField = document.getElementById("email");
      const passwordField = document.getElementById("password");

      if (getCookie("type") !== "aluno" && getCookie("type") !== "professor") {
        errors.push("Nenhum tipo definido. Recarregue a página!");
        setDisable(true);
        throw new Error("Tipo indefinido");
      }

      if (
        (emailField.value === null || emailField.value === "") &&
        (passwordField.value === null || passwordField.value === "")
      ) {
        warnings.push("Os campos não devem estar vazios");
      } else {
        if (emailField.value === null || emailField.value === "") {
          warnings.push("O email não deve ser vazio");
        }

        if (passwordField.value === null || passwordField.value === "") {
          warnings.push("A senha não deve ser vazia");
        }
      }

      if (
        emailField.value.toLowerCase().includes("@") ||
        emailField.value.toLowerCase().includes("fatec") ||
        emailField.value.toLowerCase().includes("sp.gov.br")
      ) {
        warnings.push("Não é necessário adicionar o domínio ao email");
      }

      if (errors.length > 0 || warnings.length > 0) {
        throw new Error("Não pode prosseguir");
      }

      const createUserOrLogin = async () => {
        try {
          const URL = "http://localhost:3001/users";
          const response = await fetch(`${URL}/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(FormData),
          });

          if (!response.ok && response.status !== 409) {
            errors.push("Email ou senha incorretos");
          }

          const json = await response.json();

          if (json.message === "Tipo incorreto (aluno)") {
            errors.push("Você não é um aluno");
          } else if (json.message === "Tipo incorreto (professor)") {
            errors.push("Você não é um professor");
            console.log("Teste 2");
          }

          if (errors.length > 0 || warnings.length > 0) {
            throw new Error("Não pode prosseguir");
          }

          setCookie("token", json.token);

          Router.push("/menu");
        } catch (err) {
          console.log(err);
          if (errors.length > 0 || warnings.length > 0) {
            displayAlert(errors, warnings);
          }
          document.getElementById("back").classList.remove("disabled");
          document.getElementById("submit").classList.remove("disabled");
        }
      };

      createUserOrLogin();
    } catch (err) {
      console.log(err);
      if (errors.length > 0 || warnings.length > 0) {
        displayAlert(errors, warnings);

        if (errors[0] === "Nenhum tipo definido. Recarregue a página!") {
          return;
        }
      }
      document.getElementById("back").classList.remove("disabled");
      document.getElementById("submit").classList.remove("disabled");
    }
  };

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div className="d-flex flex-column mb-3">
          <div className="input-group input-group-lg mb-2">
            <input
              type="text"
              id="email"
              onChange={updateValue}
              className="form-control"
              placeholder="Email"
              aria-label="Email"
              aria-describedby="basic-addon2"
              disabled={Disable}
            />
            <span
              className="red-text input-group-text fw-semibold"
              id="basic-addon2"
            >
              @fatec.sp.gov.br
            </span>
          </div>
          <div className="input-group input-group-lg mb-3">
            <input
              type="password"
              id="password"
              onChange={updateValue}
              className="form-control"
              placeholder="Senha"
              aria-label="Senha"
              aria-describedby="basic-addon1"
              disabled={Disable}
            />
            <span className="input-group-text" id="basic-addon1">
              <i
                className="bi bi-eye-fill red-text cursor"
                id="eye"
                onClick={changePasswordVisibility}
              />
            </span>
          </div>
          <div className="d-flex text-center justify-content-center">
            <button
              id="back"
              className="red btn btn-primary btn-lg fw-bold me-3 w-100"
              onClick={handleClick}
            >
              Voltar
            </button>
            <button
              id="submit"
              className="red btn btn-primary btn-lg fw-bold w-100"
              onClick={handleClick}
            >
              Avançar
            </button>
          </div>
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
    if (token) {
      const URL = process.env.URL ?? "http://localhost:3001";
      const response = await fetch(`${URL}/users/single?id=${token}`);

      if (!response.ok) {
        if (type) {
          return {
            props: {},
          };
        } else {
          return {
            redirect: {
              permanent: false,
              destination: "/",
            },
            props: {},
          };
        }
      }

      const json = await response.json();

      if (
        (type !== "aluno" && type !== "professor") ||
        type !== json.formattedData.Tipo
      ) {
        setCookie("type", json.formattedData.Tipo, { req, res });
      }

      return {
        redirect: {
          permanent: false,
          destination: "/menu",
        },
        props: {},
      };
    } else {
      if (type !== "aluno" && type !== "professor") {
        throw new Error("Tipo invalido");
      }
    }
  } catch (err) {
    console.log(err);
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default Login;
