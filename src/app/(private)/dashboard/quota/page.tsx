export default function QuotaPage() {
  return (
    <section className={``}>
      <article
        className={`content-section py-32 px-5 sm:px-20 xl:px-36 flex flex-col bg-ravenci-dark text-white`}
      >
        <h1 className={`text-4xl md:text-5xl lg:text-h1 font-medium`}>Quota</h1>
        <h2 className={`text-2xl md:text-3xl lg:text-h2 font-light`}>
          Your quota usage
        </h2>
      </article>

      <article
        className={`content-section py-20 px-5 sm:px-20 xl:px-36 pb-16 lg:pb-32 bg-white`}
      >
        <div
          className={`col-span-12 lg:col-span-8 flex flex-col justify-center gap-5 max-w-3xl`}
        >
          <p className={`max-w-3xl`}>
            Your quota usage is currently at {/* TODO */} out of {/* TODO */}.
          </p>
        </div>
      </article>
    </section>
  );
}
