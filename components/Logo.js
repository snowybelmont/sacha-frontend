import Image from "next/image";
import LogoIMG from "@/public/fatec-logo.png";

function Logo() {
  return (
    <Image
      src={LogoIMG}
      className="img-fluid mb-4"
      alt="Logo da Fatec"
      width={300}
      priority
    />
  );
}

export default Logo;
