import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { getCookie, setCookie } from "cookies-next";
import Logo from "@/components/Logo";

const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false });

const ReadQRCode = () => {
  const [result, setResult] = useState();

  const handleScan = (data) => {
    if (data) {
      setResult(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
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
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: "environment",
            }}
          />
          <p>Resultado: {result}</p>
        </div>
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
