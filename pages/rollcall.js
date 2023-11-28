import Router from "next/router";
import { useState, useEffect } from "react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import nProgress from "nprogress";
import Logo from "@/components/Logo";

function RollCall({ token }) {
  const [presences, setPresences] = useState([]);

  useEffect(() => {
    const fetchPresences = async () => {
      try {
        const response = await fetch(
          "https://projeto-sacha.onrender.com/presences/all"
        );
        if (response.ok) {
          const data = await response.json();
          setPresences(data.presences);
        } else {
          console.error("Failed to fetch presences");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPresences();
  }, []);

  return (
    <div className="container py-4 text-center">
      <div className="container-fluid">
        <Logo />
        <div className="d-flex flex-column mb-3">
          <div id="list" className="list-group">
            {presences.map((presence) => (
              <EstudantItem
                key={presence.estudant_RA}
                ra={presence.estudant_RA}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EstudantItem({ ra }) {
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
          console.error(`Failed to fetch user data for RA ${ra}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, [ra]);

  if (!userData) {
    return (
      <div
        className="alert alert-danger text-start alert-dismissible"
        role="alert"
      >
        Por enquanto nenhuma presença
      </div>
    );
  }

  return (
    <a
      className="list-group-item list-group-item-action bg"
      aria-current="true"
    >
      <div className="d-flex align-items-center justify-content-center">
        <img
          src={userData.Foto} // replace with the actual property from your user data
          className="rounded me-3"
          width={100}
          height={100}
          alt={"Foto do Estudante"}
        />
        <div>
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">{userData.Nome}</h5>
          </div>
          <div className="d-flex justify-content-evenly align-items-center">
            <small>{userData.Classe[1].substring(8)}</small>
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
        props: { token },
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
    props: { token },
  };
};

export default RollCall;
