"use client";

export default function HomeHero() {
  // Functions
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="py-52 flex flex-col justify-center items-center w-full min-h-fit bg-qrmory-purple-800 text-white">
      <div className="px-2 sm:px-6 w-full max-w-60 sm:max-w-7xl text-center">
        <h1 className="font-header text-2xl sm:text-3xl lg:text-5xl hero-heading">
          Generate an <span>arsenal</span> of QR Codes
        </h1>

        <h3 className="mt-2 font-serif text-sm sm:text-xl lg:text-2xl tracking-widest drop-shadow-lg">
          Be equipped for anything with QRmory
        </h3>

        <section className="mt-16 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 font-serif">
          <button
            onClick={() => scrollTo(`start-creating`)}
            className="py-3 px-6  hover:translate-x-1 hover:-translate-y-1 bg-white hover:bg-qrmory-purple-400 rounded text-qrmory-purple-800 hover:text-white text-sm sm:text-base font-bold shadow-lg shadow-qrmory-purple-900 hover:shadow-xltransition-all duration-300"
          >
            Start Creating
          </button>

          <button
            onClick={() => scrollTo(`learn-more`)}
            className="py-3 px-6 hover:translate-x-1 hover:-translate-y-1 hover:bg-qrmory-purple-400 border border-white hover:border-qrmory-purple-400 rounded text-white text-sm sm:text-base font-bold transition-all duration-300"
          >
            Learn More
          </button>
        </section>
      </div>
    </header>
  );
}
