import FullLogo from "@/components/full-logo";

export default function MainFooter() {
  // Constants
  const exploreLinks = {
    // about: ["About", "/about"],
    // aboutQRCodes: ["More About QR Codes", "/more-about-qr-codes"],
    // features: ["Features", "/features"],
    // pricing: ["Pricing", "/pricing"],
    // blog: ["Blog", "/blog"],
  };

  const supportLinks = {
    helpCenter: ["Help Center", "/help"],
    contact: ["Contact Us", "/help/contact"],
  };

  const importantLinks = [
    {
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
    { title: "Terms + Conditions", link: "/terms-and-conditions" },
    { title: "Cookie Policy", link: "/cookie-policy" },
  ];

  return (
    <footer
      className={`mx-auto pt-7 pb-4 md:py-8 px-8 w-full max-w-7xl border-t-1 border-neutral-300 text-qrmory-purple-800`}
    >
      <section className="mx-auto flex md:flex-row flex-col md:justify-between justify-center items-stretch md:gap-4 gap-16 w-full md:text-left text-center">
        <article className="flex flex-col md:w-2/5 w-full md:items-start items-center">
          <a href="/">
            <FullLogo className="mb-2 w-12 sm:w-16 fill-qrmory-purple-800" />
          </a>
          <p className="mt-4 max-w-60 sm:max-w-xs text-sm sm:text-base">
            Generate an arsenal of great QR Codes simply and quickly with
            QRmory.
          </p>
          {/*<h4 className="mb-2 text-xl font-bold">Follow Us</h4>*/}
          {/*<div className="flex flex-row gap-2 md:justify-start justify-center">*/}
          {/*    <a*/}
          {/*        className="hover:scale-110 hover:text-qrmory-purple-700 transition-all duration-300"*/}
          {/*        href="https://facebook.com/qrmory"*/}
          {/*        target="_blank"*/}
          {/*    >*/}
          {/*        <FaFacebookSquare size={30} />*/}
          {/*    </a>*/}
          {/*    <a*/}
          {/*        className="hover:scale-110 hover:text-qrmory-purple-700 transition-all duration-300"*/}
          {/*        href="https://twitter.com/qrmory"*/}
          {/*        target="_blank"*/}
          {/*    >*/}
          {/*        <FaTwitterSquare size={30} />*/}
          {/*    </a>*/}
          {/*    <a*/}
          {/*        className="hover:scale-110 hover:text-qrmory-purple-700 transition-all duration-300"*/}
          {/*        href="https://instagram.com/qrmory"*/}
          {/*        target="_blank"*/}
          {/*    >*/}
          {/*        <FaInstagramSquare size={30} />*/}
          {/*    </a>*/}
          {/*</div>*/}
        </article>

        <article className="md:w-1/5 w-full">
          <h4 className="mb-4 font-bold text-lg md:text-xl">Explore</h4>
          <ul>
            {Object.keys(exploreLinks).map((key, index) => (
              <li className="my-2" key={key}>
                <a
                  className="py-0.5 px-1 text-base text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500"
                  href={exploreLinks[key as keyof typeof exploreLinks][1]}
                >
                  {exploreLinks[key as keyof typeof exploreLinks][0]}
                </a>
              </li>
            ))}
          </ul>
        </article>

        <article className="md:w-1/5 w-full">
          <h4 className={`mb-4 font-bold text-lg md:text-xl`}>Support</h4>
          <ul className={`mb-10`}>
            {Object.keys(supportLinks).map((key, index) => (
              <li className={`my-2`} key={key}>
                <a
                  className={`py-0.5 px-1 text-base text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500`}
                  href={supportLinks[key as keyof typeof supportLinks][1]}
                >
                  {supportLinks[key as keyof typeof supportLinks][0]}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className={`mt-10`}>
        <h4 className={`md:hidden mb-4 font-bold text-lg text-center`}>
          Legal Information
        </h4>
        <ul className={`flex flex-col-reverse md:flex-row items-center gap-4`}>
          <li
            className={`mt-4 md:mt-0 pt-4 md:py-0.5 px-1 w-full md:w-fit border-t md:border-none text-sm text-neutral-400 text-center md:text-left`}
          >
            © 2025 QRmory. All rights reserved
          </li>
          {importantLinks.map((item, index) => (
            <li className={``} key={`important-link-${index}`}>
              <a
                className="py-0.5 px-1 text-sm text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500"
                href={item.link}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </footer>
  );
}
