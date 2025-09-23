export const metadata = {
  title: "Thank you for Registering | QRmory",
  description: "Thank you for registering at QRmory.",
};

export default function CheckEmailPage() {
  return (
    <section
      className={`flex-grow px-[25px] grid grid-cols-1 max-w-lg items-center`}
    >
      <article>
        <h1 className={`md:text-xl font-bold`}>Thank You!</h1>
        <h2 className={`text-sm md:text-base text-neutral-600 font-light`}>
          You're all signed up. Please check your email.
        </h2>

        <p className={`my-10 text-neutral-600`}>
          We've sent you a verification link to your email address.
          <br />
          Please check your inbox, and maybe your spam folder.
        </p>

        <div className={`mt-2 border-t text-neutral-600`}>
          <span className={`text-sm`}>
            If you have any problems, please get in touch with us through our{" "}
            <a
              href={`/help/contact`}
              className={`text-qrmory-purple-500 font-bold`}
            >
              contact form
            </a>
            .
          </span>
        </div>
      </article>
    </section>
  );
}
