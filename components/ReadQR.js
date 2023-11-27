import { useState } from "react";
import QrReader from "react-qr-reader";

const QrCodeReader = () => {
  const [result, setResult] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setResult(data);
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  return (
    <div>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%" }}
      />
      {result && <p>Resultado do QR Code: {result}</p>}
    </div>
  );
};

export default QrCodeReader;
