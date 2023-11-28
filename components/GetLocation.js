const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(new Error(`Erro ao obter a localização: ${error.message}`));
        }
      );
    } else {
      reject(new Error("Geolocalização não é suportada neste navegador."));
    }
  });
};

export default getLocation;
