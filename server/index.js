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
  console.log("post/authorize");

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
  console.log("get/plan/new");

  const { product, recipe } = req.params;
  const { amount } = req.query;
  res.json(await generate(product, Number(amount), recipe));
});

apiRouter.get("/plan/:id", async (req, res) => {
  console.log("get/plan/id");

  const { id } = req.params;
  const { name, description, isPublic, creator } = await plansRdb.select({
    id,
  });

  let isSharedTo = false;

  const username = auhtenticateToken(req);
  if (username) {
    const { id: accountId } = await accountRdb.select({ username });
    const accountPlanRdbResult = await accountPlanRdb.select({
      accountId,
      planId: id,
    });
    if (username !== creator && accountPlanRdbResult?.shared !== 1) {
      return res.sendStatus(username ? 403 : 401);
    }
    if (accountPlanRdbResult?.shared === 1) {
      isSharedTo = true;
    }
  }

  if (!isPublic && !isSharedTo && creator !== username) {
    return res.sendStatus(401);
  }

  const planJson = await plansCdb.get(id);

  res.json({
    name,
    description,
    creator,
    isPublic: isPublic && true,
    plan: planJson,
    isSharedTo,
  });
});

apiRouter.get("/products", async (req, res) => {
  console.log("get/products");

  res.json(Object.keys(await getProducts()));
});

apiRouter.use(authenticateTokenMiddleware);

apiRouter.delete("/deauthorise", async (req, res) => {
  res.clearCookie("authToken");
  res.end();
});

apiRouter.get("/authenticate", async (req, res) => {
  console.log("get/authenticate");

  res.json(req.username).status(200);
});

apiRouter.get("/plan/favourite/:id", async (req, res) => {
  console.log("get/plan/favourite");

  const { id } = req.params;

  const { isPublic, creator } = await plansRdb.select({ id });
  const { id: accountId } = await accountRdb.select({ username: req.username });
  const accountPlanRdbResult = await accountPlanRdb.select({
    accountId,
    planId: id,
  });

  if (
    !isPublic &&
    req.username !== creator &&
    accountPlanRdbResult?.shared !== 1
  ) {
    return res.sendStatus(403);
  }

  if (!accountPlanRdbResult) {
    return res.sendStatus(404);
  }

  res.json({ favourite: accountPlanRdbResult.favourite ? true : false });
});

apiRouter.put("/plan/favourite/:id", async (req, res) => {
  console.log("put/plan/favourite");

  const { id } = req.params;
  const { isPublic, creator } = await plansRdb.select({
    id,
  });

  const { id: accountId } = await accountRdb.select({ username: req.username });
  const accountPlanRdbResult = await accountPlanRdb.select({
    accountId,
    planId: id,
  });

  if (
    !isPublic &&
    req.username !== creator &&
    accountPlanRdbResult?.shared !== 1
  ) {
    return res.sendStatus(403);
  }

  const result = await accountPlanRdb.insert({
    accountId,
    planId: id,
    shared: accountPlanRdbResult?.shared ? 1 : 0,
    favourite: accountPlanRdbResult?.favourite ? 0 : 1,
  });
  res.sendStatus(200);
});

apiRouter.get("/plan/shared/:id", async (req, res) => {
  console.log("get/plan/shared");

  const { id } = req.params;

  const { creator } = await plansRdb.select({ id });

  if (req.username !== creator) {
    return res.sendStatus(403);
  }

  const result = await accountPlanRdb.select({ planId: id });
  const sharedTo = await Promise.all(
    result
      .filter((entry) => entry.shared === 1)
      .map(async (entry) => {
        const { username } = await accountRdb.select({ id: entry.accountId });
        return username;
      })
  );
  res.json(sharedTo);
});

apiRouter.put("/plan/shared/:id?", async (req, res) => {
  console.log("put/plan/shared");

  const { id } = req.params;
  const { username } = req.query;

  const { id: accountId } = await accountRdb.select({ username: username });
  const { creator, isPublic } = await plansRdb.select({ id });
  const accountPlanRdbResult = await accountPlanRdb.select({
    accountId,
    planId: id,
  });

  if (req.username !== creator) {
    return res.sendStatus(403);
  }

  if (!isPublic && accountPlanRdbResult?.shared === 1) {
    accountPlanRdbResult.favourite = 0;
  }

  const result = await accountPlanRdb.insert({
    accountId,
    planId: id,
    shared: accountPlanRdbResult?.shared ? 0 : 1,
    favourite: accountPlanRdbResult?.favourite ? 1 : 0,
  });
  res.sendStatus(200);
});

apiRouter.put("/plan/:id", async (req, res) => {
  console.log("put/plan");

  const { name, description, creator, plan, isPublic } = req.body;
  const { id } = req.params;

  const rdbResult = await plansRdb.select({ id });
  const { id: accountId } = await accountRdb.select({ username: req.username });
  const accountPlanRdbResult = await accountPlanRdb.select({
    accountId,
    planId: id,
  });

  if (
    (rdbResult && req.username !== rdbResult?.creator) ||
    accountPlanRdbResult?.shared === 0
  ) {
    res.sendStatus(403);
  }

  const cdbResult = await plansCdb.get(id);

  if (!cdbResult || JSON.stringify(cdbResult) !== JSON.stringify(plan)) {
    const rev = await plansCdb.getRevision(id);
    const cdbResponse = await plansCdb.put(id, plan, rev);
  }

  const rdbResponse = await plansRdb.insert({
    id,
    creator,
    name,
    description,
    product: plan.item,
    amount: plan.amount,
    isPublic,
  });

  res.sendStatus(200);
});

apiRouter.delete("/plan/:id", async (req, res) => {
  console.log("delete/plan");

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

apiRouter.get("/account/plan", async (req, res) => {
  console.log("get/account/plan");

  const plansRdbResult = await plansRdb.selectWhere({
    field: "creator",
    value: req.username,
  });
  const { id: accountId } = await accountRdb.select({ username: req.username });
  const accountPlanRdbResult = await accountPlanRdb.select({
    accountId: accountId,
  });

  const favourite = [];
  const shared = [];

  accountPlanRdbResult.forEach((plan) => {
    if (plan.shared) {
      shared.push(plansRdb.select({ id: plan.planId }));
    }
    if (plan.favourite) {
      favourite.push(plansRdb.select({ id: plan.planId }));
    }
  });

  res.json({
    public: plansRdbResult.filter((plan) => plan.isPublic),
    private: plansRdbResult.filter((plan) => !plan.isPublic),
    favourite: await Promise.all(favourite),
    shared: await Promise.all(shared),
  });
});

server.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
