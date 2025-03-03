export default async function AccountInfo() {
  // const supabase = createClient();
  // const [user, products, subscription] = await Promise.all([
  //     getUser(supabase), getProducts(supabase), getSubscription(supabase)
  // ])

  // NO USER
  // const [user, products, subscription] = await Promise.all([
  //   null,
  //   getProducts(supabase),
  //   getSubscription(supabase),
  // ]);

  // TEMP
  const [user, products, subscription] = [null, null, null];

  return (
    <div className={`flex flex-col w-full`}>
      <h1 className={`mb-4 text-xl font-bold`}>Account Info</h1>
      {/*<PricingTable*/}
      {/*  user={user}*/}
      {/*  products={products ?? []}*/}
      {/*  subscription={subscription}*/}
      {/*/>*/}
    </div>
  );
}
