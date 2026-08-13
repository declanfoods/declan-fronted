import { type PropsWithChildren } from "react";

interface ContainerProps {
  className?: string;
}

export default function Container({
  children,
  className = "",
}: PropsWithChildren<ContainerProps>) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}