import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { generate } from "./utils/generate-plan.js";
import { getProducts } from "./utils/get-products.js";
import "./utils/plan-rdb.js";
import { selectAccount } from "./utils/account-rdb.js";
import { generateToken, authenticateToken } from "./utils/authorize.js";
import plansCdb from "./utils/plans-db.js";
import plansRdb from "./utils/plan-rdb.js";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
server.use(express.json());
const apiRouter = express.Router();

apiRouter.post("/authorise", async (req, res) => {
  const { username, password } = req.body;
  const account = await selectAccount({ username });
  // const account = username === "Lare" ? { password: "yes" } : null;

  if (account && password === account.password) {
    const token = generateToken(username);
    res.cookie("authToken", token, {
      maxAge: process.env.TOKEN_LIFETIME,
      httpOnly: true,
      sameSite: "strict",
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

apiRouter.get("/plan/new/:product/:recipe?", async (req, res) => {
  const { product, recipe } = req.params;
  const { amount } = req.query;
  res.json(await generate(product, Number(amount), recipe));
});

apiRouter.get("/plan/:id", async (req, res) => {
  const { id } = req.params;
  // res.json(await generate("Crystal Oscillator", 100));
  const { name, description, isPublic, creator } = await plansRdb.select({
    id,
  });
  const planJson = await plansCdb.get(id);

  res.json({
    name,
    description,
    creator,
    isPublic: isPublic && true,
    plan: planJson,
  });
});

apiRouter.get("/products", async (req, res) => {
  res.json(Object.keys(await getProducts()));
});

apiRouter.use(authenticateToken);

apiRouter.get("/authenticate", async (req, res) => {
  res.json(req.username).status(200);
});

apiRouter.post("/plan/:username/:id", async (req, res) => {
  const { name, description, plan, isPublic } = req.body;
  const { username, id } = req.params;
  console.log("id:", id);
  // 5459f124-6a18-45fc-ab04-7ba125032e18

  console.log(
    await plansRdb.insert({
      id,
      name,
      description,
      product: plan.item,
      amount: plan.amount,
      isPublic,
      creator: username,
    })
  );
  // const response = putPlan(id, plan);
  console.log("response:", await plansCdb.put(id, plan));
});

server.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
