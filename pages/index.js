import Router from "next/router";
import Logo from "@/components/Logo";
import { setCookie } from "cookies-next";

function Home() {
  const displayAlert = (alertBox) => {
    if (alertBox) {
      if (alertBox.classList.contains("d-none")) {
        alertBox.classList.remove("d-none");
      }

      if (alertBox.classList.contains("alert-danger")) {
        alertBox.classList.remove("alert-danger");
      }

      alertBox.classList.add("alert-danger");
      alertBox.textContent = "Um erro inesperado aconteceu!";
    } else {
      throw new Error("Elemento alerta não encontrado");
    }
  };

  const handleClick = (event) => {
    const alertBox = document.getElementById("alert");

    alertBox.classList.remove("alert-danger");
    alertBox.textContent = "";
    alertBox.classList.add("d-none");

    try {
      document.getElementById("estudant").classList.add("disabled");
      document.getElementById("teacher").classList.add("disabled");

      if (event.target.id === "estudant") {
        setCookie("type", "aluno");
      } else if (event.target.id === "teacher") {
        setCookie("type", "professor");
      } else {
        displayAlert(alertBox);
        throw new Error("O tipo definido é inválido");
      }

      Router.push("/login");
    } catch (err) {
      console.log(err);
      document.getElementById("estudant").classList.remove("disabled");
      document.getElementById("teacher").classList.remove("disabled");
      return;
    }
  };

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div className="d-flex flex-column mb-3">
          <button
            id="teacher"
            className="red btn btn-primary btn-lg fw-bold mb-3"
            onClick={handleClick}
          >
            Professores
          </button>
          <button
            id="estudant"
            className="red btn btn-primary btn-lg fw-bold"
            onClick={handleClick}
          >
            Alunos
          </button>
        </div>
        <div className="d-none alert" id="alert" role="alert"></div>
      </div>
    </div>
  );
}

export default Home;
