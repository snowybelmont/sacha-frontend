import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";

const QRCodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [CameraReady, setCameraReady] = useState(true);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setCameraReady(true);
        requestAnimationFrame(handleScan);
      } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        setCameraReady(false);
      }
    };

    const handleScan = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setResult(code);
          onScan(code);
        }

        requestAnimationFrame(handleScan);
      }
    };

    initializeCamera();

    return () => {
      const video = videoRef.current;
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [onScan, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prevMode) =>
      prevMode === "environment" ? "user" : "environment"
    );
    setCameraReady(true);
  };

  return (
    <div>
      {CameraReady ? (
        <>
          <video ref={videoRef} style={{ display: "none" }} />
          <canvas ref={canvasRef} style={{ width: "100%", height: "300px" }} />
          <p>Resultado: {result ? result.data : "Nenhum QR code detectado"}</p>
          <button
            id="toggle"
            className="red btn btn-primary btn-lg fw-bold me-3 w-100"
            onClick={toggleFacingMode}
          >
            Alternar Câmera
          </button>
        </>
      ) : (
        <>
          <div id="container-alerts">
            <div
              className="alert alert-danger text-start alert-dismissible"
              role="alert"
            >
              Câmera indisponível
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QRCodeScanner;
