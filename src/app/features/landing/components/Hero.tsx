export function Hero() {
  return (
    <section
      className="flex items-center"
      style={{
        height: "calc(clamp(280px, 60vh, 700px) - clamp(4rem, 8vh, 7rem))",
      }}
    >
      {/* Text: left 30% white zone only */}
      <div
        className="flex flex-col justify-center gap-3 lg:gap-5"
        style={{ width: "clamp(120px, 30%, 400px)", paddingRight: "clamp(0.5rem, 2vw, 2rem)" }}
      >
        <h1
          className="font-serif font-semibold leading-[140%] text-gray-900"
          style={{ fontSize: "clamp(0.9rem, 2.8vw, 2.5rem)" }}
        >
          Fresh Food Delivered, <br />
          <span className="text-[#D47E2D]">Free & fast</span> <br />
          at your doorstep.
        </h1>

        <p
          className="font-sans text-gray-600 leading-relaxed"
          style={{ fontSize: "clamp(0.65rem, 1.2vw, 1rem)", maxWidth: "32ch" }}
        >
          Craving something delicious? Declan Foods brings the best meals
          and fresh ingredients right to your door. Quick, reliable, and
          always fresh.
        </p>

        <div className="flex items-center" style={{ gap: "clamp(0.4rem, 1vw, 0.75rem)" }}>
          <button
            className="bg-[#D47E2D] hover:bg-[#b86d26] text-white font-sans font-medium rounded-full transition-colors"
            style={{
              fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
              padding: "clamp(0.35rem, 0.8vw, 0.65rem) clamp(0.75rem, 1.5vw, 1.75rem)",
            }}
          >
            Order Now
          </button>
          <button
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-sans font-medium rounded-full shadow-sm transition-all"
            style={{
              fontSize: "clamp(0.6rem, 1vw, 0.9rem)",
              padding: "clamp(0.35rem, 0.8vw, 0.65rem) clamp(0.75rem, 1.5vw, 1.75rem)",
            }}
          >
            Track Order
          </button>
        </div>
      </div>
    </section>
  );
}