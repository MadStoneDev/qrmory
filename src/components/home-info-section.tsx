export default function HomeInfo() {
  return (
    <section
      id={`learn-more`}
      className="pt-14 pb-10 px-6 lg:px-12 bg-stone-100 w-full rounded-lg text-qrmory-purple-800 text-center"
    >
      <h3 className="text-lg sm:text-xl uppercase font-bold">
        Hey there, QR code creators!
      </h3>

      <article className="mx-auto mt-4 w-full max-w-2xl">
        <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">
          We're all about keeping things fun and safe here at QRmory. While
          we're just the middleman for your awesome QR codes, we still want to
          make sure everything stays cool and above board. Here's the deal:
          We've got our eyes peeled 24/7 to make sure no one's using our service
          for any sketchy stuff. Even though we're not responsible for where
          your QR codes lead (that's on you!), we're committed to keeping things
          legit and user-friendly.
        </p>
        <p className="pt-4 font-light sm:text-xl leading-7 sm:leading-9">
          So, what's off-limits? Basically, anything illegal or harmful. For
          example:
        </p>
        <ul className="pb-4 font-bold sm:text-xl leading-7 sm:leading-9">
          <li>Content that could be harmful to kids or minors</li>
          <li>Targeting specific groups in a dangerous or hateful way</li>
          <li>Anything promoting violence or illegal activities</li>
          <li>Spam or things that encourage self-harm</li>
        </ul>
        <p className="mx-auto py-4 font-light sm:text-xl leading-7 sm:leading-9 max-w-md">
          Keep it clean, keep it fun! 😎
        </p>
      </article>

      {/*<h3 className="font-serif text-lg sm:text-xl uppercase font-bold">*/}
      {/*  What is a QR Code anyway?*/}
      {/*</h3>*/}
      {/*<h2 className="-mt-1 font-header text-2xl sm:text-4.5xl">*/}
      {/*  and how does it work*/}
      {/*</h2>*/}

      {/*<article className="mt-12 w-full max-w-lg.5">*/}
      {/*  <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">*/}
      {/*    If we were to sum up what QR codes are in one sentence, it'd be this:{" "}*/}
      {/*    <span className="font-normal">*/}
      {/*      QR Codes are barcodes on steroids, in every way.*/}
      {/*    </span>*/}
      {/*  </p>*/}
      {/*  <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">*/}
      {/*    Where barcodes are one-dimensional and capable of generating around 10*/}
      {/*    trillion unique codes, QR Codes are two-dimensional with near an*/}
      {/*    infinite number of unique codes. Where barcodes are used predominantly*/}
      {/*    for products and retail,{" "}*/}
      {/*    <strong className="font-normal">*/}
      {/*      QR Codes can be used for anything!*/}
      {/*    </strong>*/}
      {/*  </p>*/}
      {/*  <p className="py-4 font-light sm:text-xl leading-7 sm:leading-9">*/}
      {/*    Sharing a website with many people? Offering WIFI access safely and*/}
      {/*    seamlessly? Setting up an easier way for diners to order from the*/}
      {/*    menu? Collecting feedback for a product?*/}
      {/*  </p>*/}
      {/*  <p className="py-4 sm:text-xl font-normal leading-7 sm:leading-9">*/}
      {/*    QR Codes are perfect for all of that and more.*/}
      {/*  </p>*/}
      {/*</article>*/}
    </section>
  );
}
