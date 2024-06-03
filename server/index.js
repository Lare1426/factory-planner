import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { generate } from "./utils/generate-plan.js";
import { getProducts } from "./utils/get-products.js";
import "./utils/plan-rdb.js";
import {
  generateToken,
  auhtenticateToken,
  authenticateTokenMiddleware,
} from "./utils/authorize.js";
import plansCdb from "./utils/plans-db.js";
import plansRdb from "./utils/plan-rdb.js";
import accountPlanRdb from "./utils/account-plan-rdb.js";
import accountRdb from "./utils/account-rdb.js";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
server.use(express.json());
const apiRouter = express.Router();

apiRouter.post("/authorise", async (req, res) => {
  const { username, password } = req.body;
  const account = await accountRdb.select({ username });

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
  const { name, description, isPublic, creator } = await plansRdb.select({
    id,
  });

  if (!isPublic) {
    const username = auhtenticateToken(req);
    if (username !== creator) {
      return res.sendStatus(username ? 403 : 401);
    }
  }

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

apiRouter.use(authenticateTokenMiddleware);

apiRouter.get("/authenticate", async (req, res) => {
  res.json(req.username).status(200);
});

apiRouter.post("/plan/:username/:id", async (req, res) => {
  const { name, description, plan, isPublic } = req.body;
  const { username, id } = req.params;
  console.log("id:", id);

  const rdbResponse = await plansRdb.insert({
    id,
    name,
    description,
    product: plan.item,
    amount: plan.amount,
    isPublic,
    creator: username,
  });
  const putResult = await plansCdb.put(id, plan);
  res.json({
    rdbResponse,
    putResult,
  });
});

apiRouter.delete("/plan/:id", async (req, res) => {
  const { id } = req.params;
  const { creator } = await plansRdb.select({
    id,
  });

  if (req.username !== creator) {
    res.sendStatus(403);
  }

  const rdbDeleteResult = await plansRdb.del({ id });
  const cdbDeleteResult = await plansCdb.del(id);
  res.sendStatus(200);
});

apiRouter.put("/plan/favourite/:id", async (req, res) => {
  const { id } = req.params;
  const { isPublic } = await plansRdb.select({
    id,
  });

  if (!isPublic) {
    res.sendStatus(403);
  }

  const { id: accountId } = await accountRdb.select({ username: req.username });
  const result = await accountPlanRdb.insert({
    accountId,
    planId: id,
    favourite: 1,
    shared: 0,
  });
  res.sendStatus(200);
});

apiRouter.put("/plan/shared/:id?", async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;

  const { creator } = await plansRdb.select({ id });

  if (req.username !== creator) {
    res.sendStatus(403);
  }

  const { id: accountId } = await accountRdb.select({ username: username });

  console.log(accountId);

  const result = await accountPlanRdb.insert({
    accountId,
    planId: id,
    shader: 1,
  });
  res.sendStatus(200);
});

server.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
