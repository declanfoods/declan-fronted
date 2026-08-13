import logo from '../../assets/brandlogo.png';

export default function SplashLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8">
      <img src={logo} alt="Declan Foods" className="w-40 animate-pulse sm:w-48" />
      <p className="mt-4 text-sm font-medium text-primary italic">
        .....loading your goodies
      </p>
    </div>
  );
}