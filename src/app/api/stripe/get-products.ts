import stripe from "./stripe";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const products = await stripe.products.list({
        expand: ["data.default_price"],
      });

      const formattedProducts = products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
      }));

      res.status(200).json(formattedProducts);
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
  }
}
