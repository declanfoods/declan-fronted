import { Search } from "lucide-react";
import { Link } from "react-router";
import brandLogo from "@/app/assets/brandlogo.png";


export function Navbar() {
  return (
    <nav
      className="flex items-center justify-between"
      style={{ height: "clamp(4rem, 8vh, 7rem)" }}
    >
      {/* Logo: white zone (left 30%) */}
      <div style={{ width: "clamp(120px, 30%, 400px)" }}>
        <img
          src={brandLogo}
          alt="Declan Foods"
          className="w-auto"
          style={{ height: "clamp(2.5rem, 5vw, 4.5rem)" }}
        />
      </div>

      {/* Nav links + search: green zone (right 70%) */}
      <div
        className="flex items-center justify-between"
        style={{
          width: "clamp(200px, 70%, 900px)",
          paddingLeft: "clamp(0.5rem, 3vw, 3rem)",
        }}
        >
        <div className="hidden md:flex items-center" style={{ gap: "clamp(0.75rem, 2vw, 2rem)" }}>
          {['Home', 'Catalog', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="text-white font-sans font-medium hover:text-gray-200 transition-colors"
              style={{ fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)" }}
            >
              {item}
            </Link>
          ))}
        </div>

        <div
          className="relative flex items-center bg-white rounded-lg shadow-sm"
          style={{
            padding: "clamp(0.35rem, 0.8vw, 0.75rem) clamp(0.5rem, 1vw, 1rem)",
            width: "clamp(130px, 18vw, 260px)",
            gap: "clamp(0.25rem, 0.5vw, 0.75rem)",
          }}
        >
          <Search
            className="flex-shrink-0 text-declan-green"
            style={{ width: "clamp(12px, 1.2vw, 20px)", height: "clamp(12px, 1.2vw, 20px)" }}
          />
          <input
            type="text"
            placeholder="Search products...."
            className="flex-1 bg-transparent border-none outline-none font-sans text-gray-800 placeholder:text-gray-500"
            style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}
          />
        </div>
      </div>
    </nav>
  );
}