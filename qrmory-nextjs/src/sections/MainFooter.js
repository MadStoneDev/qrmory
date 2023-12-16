import FullLogo from "../../../resources/js/Components/FullLogo";

const MainFooter = () => {
  // Constants
  const quickLinks = {
    // about: ["About", "/about"],
    features: ["More About QR Codes", "/more-about-qr-codes"],
    // features: ["Features", "/features"],
    // pricing: ["Pricing", "/pricing"],
    // blog: ["Blog", "/blog"],
  };

  const supportLinks = {
    helpCenter: ["Help Center", "/help"],
  };

  const importantLinks = {
    privacy: ["Privacy Policy", "/privacy-policy"],
    terms: ["Terms + Conditions", "/terms-and-conditions"],
    cookie: ["Cookie Policy", "/cookie-policy"],
  };

  return (
    <footer className="mx-auto my-8 py-8 px-8 w-full max-w-7xl border-t-1 border-stone-300 text-qrmory-purple-800">
      <div className="mx-auto flex md:flex-row flex-col md:justify-between justify-center items-stretch md:gap-4 gap-16 w-full md:text-left text-center">
        <article className="flex flex-col md:w-1/4 w-full md:items-start items-center">
          <a href="/">
            <FullLogo className="mb-2 w-24 fill-qrmory-purple-800" />
          </a>
          <p className="mt-4 mb-8 text-base">
            Build an arsenal of great QR Codes simply and quickly with QRmory.
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
          {/*<h4 className="mb-4 font-bold text-xl">Quick Links</h4>*/}
          {/*<ul>*/}
          {/*  {Object.keys(quickLinks).map((key, index) => (*/}
          {/*    <li className="my-2" key={key}>*/}
          {/*      <a*/}
          {/*        className="py-0.5 px-1 text-base text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500"*/}
          {/*        href={quickLinks[key][1]}*/}
          {/*      >*/}
          {/*        {quickLinks[key][0]}*/}
          {/*      </a>*/}
          {/*    </li>*/}
          {/*  ))}*/}
          {/*</ul>*/}
        </article>

        {/*<article className="md:w-1/5 w-full">*/}
        {/*  <h4 className="mb-4 font-bold text-xl">Important Information</h4>*/}
        {/*  <ul>*/}
        {/*    {Object.keys(importantLinks).map((key, index) => (*/}
        {/*      <li className="my-2" key={key}>*/}
        {/*        <a*/}
        {/*          className="py-0.5 px-1 text-base text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500"*/}
        {/*          href={importantLinks[key][1]}*/}
        {/*        >*/}
        {/*          {importantLinks[key][0]}*/}
        {/*        </a>*/}
        {/*      </li>*/}
        {/*    ))}*/}
        {/*  </ul>*/}
        {/*</article>*/}

        <article className="md:w-1/5 w-full">
          {/* Support */}
          {/*<h4 className="mb-4 font-bold text-xl">Support</h4>*/}
          {/*<ul className="mb-10">*/}
          {/*  {Object.keys(supportLinks).map((key, index) => (*/}
          {/*    <li className="my-2" key={key}>*/}
          {/*      <a*/}
          {/*        className="py-0.5 px-1 text-base text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500"*/}
          {/*        href={supportLinks[key][1]}*/}
          {/*      >*/}
          {/*        {supportLinks[key][0]}*/}
          {/*      </a>*/}
          {/*    </li>*/}
          {/*  ))}*/}
          {/*</ul>*/}

          {/* Important Links */}
          <h4 className="mb-4 font-bold text-xl">Important Information</h4>
          <ul>
            {Object.keys(importantLinks).map((key, index) => (
              <li className="my-2" key={key}>
                <a
                  className="py-0.5 px-1 text-base text-qrmory-purple-400 hover:text-white hover:bg-qrmory-purple-400 transition-all duration-500"
                  href={importantLinks[key][1]}
                >
                  {importantLinks[key][0]}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </footer>
  );
};

export default MainFooter;
