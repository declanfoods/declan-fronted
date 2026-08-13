// HeroSection.tsx — combines Navbar + Hero as one cohesive unit
import Button from '../ui/Button';
import hero from '../../assets/hero.png';
 

export default function Hero() {
  return (
    <div className="px-4 pt-4 sm:px-6">
      {/* Navbar lives inside the same padded wrapper as the hero card below it */}

      <section className="relative mt-4 w-full overflow-hidden rounded-[28px]">
        <div className="relative min-h-[480px] lg:min-h-[600px]">
          <img
            src={hero}
            alt="Fresh groceries"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/20" />

          <div className="relative z-10 flex min-h-[480px] items-center lg:min-h-[600px]">
            <div className="flex w-full justify-end px-6 sm:px-10">
              <div className="max-w-xl py-16 text-white">
                <p className="mb-4 text-sm font-semibold tracking-wide text-yellow-400">
                  ₦200 off orders from ₦15,000
                </p>

                <h1 className="text-5xl font-extrabold leading-tight lg:text-6xl">
                  Fresh Foodstuff
                  <br />
                  Delivered
                  <br />
                  to your Doorstep
                </h1>

                <p className="mt-5 text-base text-white/90 sm:text-lg">
                  Shop quality foodstuffs, groceries, and essentials delivered
                  quickly and reliably.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button variant="primary" size="lg">
                    Shop Now
                  </Button>

                  <button
                    className="inline-flex text-primary items-center justify-center rounded-full border-2 border-white bg-white px-8 py-3.5 font-semibold"
                  >
                    Browse Catalog
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
