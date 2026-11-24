import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import hero from '../../../assets/hero.png';

export default function Hero() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">
      <section className="relative mt-4 isolate overflow-hidden rounded-[28px] lg:mt-0 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[2rem] lg:bg-[#f3f5eb]">
        <div className="absolute inset-0 lg:relative lg:col-start-2 lg:row-start-1">
          <img
            src={hero}
            alt="A shopper choosing fresh produce"
            fetchPriority="high"
            className="h-full w-full object-cover lg:absolute lg:inset-0 lg:object-[42%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/20 lg:hidden" />
        </div>

        <div className="relative flex min-h-[480px] items-center justify-end px-6 text-white sm:px-10 lg:col-start-1 lg:row-start-1 lg:min-h-[530px] lg:justify-start lg:px-10 lg:text-[#153526] xl:px-14">
          <div className="max-w-xl py-16">
            <p className="mb-4 text-sm font-semibold tracking-wide text-yellow-300 lg:mb-7 lg:inline-flex lg:rounded-full lg:bg-[#e4ecd9] lg:px-4 lg:py-2 lg:tracking-normal lg:text-[#234a30]">
              ₦200 off orders from ₦15,000
            </p>

            <h1 className="text-5xl font-extrabold leading-tight lg:text-[clamp(2.55rem,4vw,3.65rem)] lg:leading-[1.06] lg:tracking-[-0.055em]">
              Fresh foodstuff<br /> delivered
              <br /> <span className="lg:text-[#327344]">to your doorstep</span>
            </h1>

            <p className="mt-5 max-w-md text-base text-white/90 sm:text-lg lg:mt-6 lg:leading-relaxed lg:text-[#42594a]">
              Shop quality foodstuffs, groceries, and essentials delivered quickly and reliably.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/app/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-primary-dark lg:bg-[#245b38] lg:hover:bg-[#153526]"
              >
                Shop Now <ArrowRight size={18} aria-hidden className="hidden lg:block" />
              </Link>
              <a
                href="#deals"
                className="hidden rounded-full border border-[#9fac96] px-6 py-4 font-semibold text-[#234a30] transition-colors hover:bg-white/70 lg:inline-flex"
              >
                Explore deals
              </a>
              <Link
                to="/app/shop"
                className="inline-flex items-center rounded-full border-2 border-white bg-white px-8 py-3.5 font-semibold text-primary lg:hidden"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
