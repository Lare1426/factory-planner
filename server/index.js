import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import generatePlan from "./utils/generate-plan.js";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
const apiRouter = express.Router();

// apiRouter.get("/plan/new/:product/:recipe?amount", async (req, res) => {
//   const { product, recipe } = req.params;
//   const { amount } = req.query;
// });

apiRouter.get("/plan/new/:product", async (req, res) => {
  const { product } = req.params;

  res.json(await generatePlan.sortRecipes(product));
});

apiRouter.get("/products", async (req, res) => {
  const products = await generatePlan.productsReduce();
  res.json(Object.keys(products));
});

server.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
