export default function HomeInfo() {
  return (
    <section
      id={`learn-more`}
      className="py-14 px-6 lg:px-12 bg-stone-100 rounded-lg text-qrmory-purple-800"
    >
      <h3 className="font-serif text-lg sm:text-xl uppercase font-bold">
        What is a QR Code anyway?
      </h3>
      <h2 className="-mt-1 font-header text-2xl sm:text-4.5xl">
        and how does it work
      </h2>

      <article className="mt-12 w-full max-w-lg.5">
        <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">
          If we were to sum up what QR codes are in one sentence, it'd be this:{" "}
          <span className="font-normal">
            QR Codes are barcodes on steroids, in every way.
          </span>
        </p>
        <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">
          Where barcodes are one-dimensional and capable of generating around 10
          trillion unique codes, QR Codes are two-dimensional with near an
          infinite number of unique codes. Where barcodes are used predominantly
          for products and retail,{" "}
          <strong className="font-normal">
            QR Codes can be used for anything!
          </strong>
        </p>
        <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">
          Sharing a website with many people? Offering WIFI access safely and
          seamlessly? Setting up an easier way for diners to order from the
          menu? Collecting feedback for a product?
        </p>
        <p className="py-4 sm:text-xl font-normal leading-7 sm:leading-9">
          QR Codes are perfect for all of that and more.
        </p>
      </article>
    </section>
  );
}
