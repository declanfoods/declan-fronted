import logo from "../../assets/brandlogo.png";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <img
      src={logo}
      alt="Declan Foods"
      className={`object-contain ${className}`}
    />
  );
}
