export default function SubscriptionPage() {
  return (
    <section className={``}>
      <article
        className={`content-section py-32 px-5 sm:px-20 xl:px-36 flex flex-col bg-ravenci-dark text-white`}
      >
        <h1 className={`text-4xl md:text-5xl lg:text-h1 font-medium`}>
          Subscription
        </h1>
        <h2 className={`text-2xl md:text-3xl lg:text-h2 font-light`}>
          Your subscription details
        </h2>
      </article>

      <article
        className={`content-section py-20 px-5 sm:px-20 xl:px-36 pb-16 lg:pb-32 bg-white`}
      >
        <div
          className={`col-span-12 lg:col-span-8 flex flex-col justify-center gap-5 max-w-3xl`}
        >
          <p className={`max-w-3xl`}>
            Your subscription is currently active. You can manage your plan and
            billing details on the{" "}
            <a
              className={`text-ravenci-primary`}
              href="https://ravenci.solutions/account/subscription"
            >
              billing page
            </a>
            .
          </p>
        </div>
      </article>
    </section>
  );
}
