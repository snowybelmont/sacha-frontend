import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";

const QRCodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const video = videoRef.current;

    const handleScan = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setResult(code);
        onScan(code);
      }

      requestAnimationFrame(handleScan);
    };

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();
      requestAnimationFrame(handleScan);
    });

    return () => {
      video.srcObject.getTracks().forEach((track) => track.stop());
    };
  }, [onScan]);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ width: "100%", height: "300px" }} />
      <p>Resultado: {result ? result.data : "Nenhum QR code detectado"}</p>
    </div>
  );
};

export default QRCodeScanner;
