import { Navbar } from "@/app/features/landing/components/NavBar";
import { Hero } from "@/app/features/landing/components/Hero";
import heroEllipse from "@/app/assets/heroellipse.webp"
import manFoodImg from "@/app/assets/manfood.webp";



export function LandingRoute() {
  return (
    <main className="relative min-h-screen bg-white overflow-hidden">

      {/* Ellipse + rider as one self-contained unit */}
      <div
        className="absolute top-0 right-0"
        style={{
            width: "clamp(320px, 70vw, 1100px)",
            height: "clamp(280px, 60vh, 700px)",
            zIndex: 0,
        }}
        >
        {/* Ellipse */}
        <img
            src={heroEllipse}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "fill" }}
        />

        {/* 
            Rider wrapper: absolutely fills the ellipse minus the nav zone at top.
            paddingTop = gap between search bar bottom and rider head (% of ellipse height)
            paddingBottom = gap between rider feet and ellipse bottom (% of ellipse height)
            These are percentages so they always scale proportionally with the ellipse.
        */}
        <div
            className="absolute flex items-stretch justify-center"
            style={{
            top: "20%",           // nav zone occupies top 20% of ellipse
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: "4%",     // gap between search bar and rider's head
            paddingBottom: "4%",  // gap between rider's feet and ellipse bottom
            paddingLeft: "5%",
            paddingRight: "5%",
            }}
        >
            <img
            src={manFoodImg}
            alt="Declan Foods Delivery Rider"
            style={{
                height: "100%",      // fills exactly the padded area — scales with ellipse
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
                objectPosition: "center bottom",
            }}
            />
        </div>
        </div>

      {/* All text content sits on top */}
      <div
        className="relative px-4 sm:px-6 lg:px-8 xl:px-16"
        style={{ zIndex: 2 }}
      >
        <Navbar />
        <Hero />
      </div>

    </main>
  );
}