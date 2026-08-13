import Logo from "../ui/Logo";

export default function AuthBranding() {
  return (
    <div className="flex flex-col items-center text-center">
     <Logo className="h-14 w-auto"/>
      <p className="mt-3 text-xl font-semibold text-primary">
        .....good food starts here
      </p>
    </div>
  );
}
