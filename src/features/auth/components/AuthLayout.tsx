import {type PropsWithChildren } from 'react';

type AuthLayoutProps = PropsWithChildren<{
  headline: string;
}>;

export default function AuthLayout({ headline, children }: AuthLayoutProps) {
  return (
    <section className="min-h-screen w-full bg-white lg:flex">
      {/* LEFT: green panel with headline */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        {/* Decorative circles */}
        <div
          aria-hidden
          className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary-bright/40"
        />
        <div
          aria-hidden
          className="absolute bottom-12 left-16 h-20 w-20 rounded-full bg-primary-bright/60"
        />
        <div
          aria-hidden
          className="absolute bottom-24 right-20 h-40 w-40 rounded-full bg-primary-bright/40"
        />

        {/* Decorative food images in circles (top-right + bottom-left) */}
        <div
          aria-hidden
          className="absolute -right-10 top-0 h-56 w-56 overflow-hidden rounded-full bg-blob-lime"
        >
          <img
            src="https://picsum.photos/seed/declan-beans/400/400"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div
          aria-hidden
          className="absolute -bottom-10 -left-10 h-56 w-56 overflow-hidden rounded-full bg-blob-lime"
        >
          <img
            src="https://picsum.photos/seed/declan-fish/400/400"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="relative max-w-md px-12 text-6xl font-extrabold leading-tight text-white lg:text-7xl">
          {headline}
        </h1>
      </div>

      {/* RIGHT: white form panel with curved left edge */}
      <div className="relative flex w-full items-center justify-center bg-white lg:w-1/2">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-0 hidden h-full w-32 rounded-br-[200px] rounded-tr-[200px] bg-white lg:block"
        />
        <div className="relative w-full max-w-lg px-6 py-12 sm:px-10 sm:py-16">
          {/* Mobile headline (on small screens, show headline text above the form) */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-4xl font-extrabold text-primary">{headline}</h1>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
