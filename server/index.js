import "dotenv/config";
import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
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
  const rdbResult = await plansRdb.select({
    id,
  });
  if (!rdbResult) {
    return res.sendStatus(404);
  }

  const { name, description, isPublic, creator } = rdbResult;

  let hasEditAccess = false;
  let isFavourite = false;

  const username = auhtenticateToken(req);
  if (username) {
    const { id: accountId } = await accountRdb.select({ username });
    const [accountPlanRdbResult] = await accountPlanRdb.select({
      accountId,
      planId: id,
    });
    if (username !== creator && !accountPlanRdbResult?.sharedTo) {
      return res.sendStatus(username ? 403 : 401);
    }
    if (accountPlanRdbResult?.sharedTo || username === creator) {
      hasEditAccess = true;
    }
    if (accountPlanRdbResult?.favourited) {
      isFavourite = true;
    }
  }

  if (!isPublic && !hasEditAccess && creator !== username) {
    return res.sendStatus(401);
  }

  if (!isPublic && !isSharedTo && creator !== username) {
    return res.sendStatus(401);
  }

  const planJson = await plansCdb.get(id);

  res.json({
    name,
    description,
    creator,
    isPublic,
    plan: planJson,
    hasEditAccess,
    isFavourite,
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
  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId,
    planId: id,
  });

  if (
    !isPublic &&
    req.username !== creator &&
    !accountPlanRdbResult?.sharedTo
  ) {
    return res.sendStatus(403);
  }

  if (!accountPlanRdbResult) {
    return res.sendStatus(404);
  }

  res.json({ favourite: accountPlanRdbResult.favourited });
});

apiRouter.post("/plan/toggle-favourite/:planId", async (req, res) => {
  console.log("post/plan/toggle-favourite");

  const { planId } = req.params;
  const { isPublic, creator } = await plansRdb.select({
    id: planId,
  });

  const { id: accountId } = await accountRdb.select({ username: req.username });
  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId,
    planId,
  });

  if (
    !isPublic &&
    req.username !== creator &&
    !accountPlanRdbResult?.sharedTo
  ) {
    return res.sendStatus(403);
  }

  if (
    !accountPlanRdbResult?.sharedTo &&
    accountPlanRdbResult?.favourited &&
    !accountPlanRdbResult?.created
  ) {
    accountPlanRdb.del({ accountId, planId });
  } else {
    const result = await accountPlanRdb.insert({
      accountId,
      planId,
      sharedTo: accountPlanRdbResult?.sharedTo,
      favourited: !accountPlanRdbResult?.favourited,
    });
  }
  res.sendStatus(200);
});

apiRouter.get("/plan/shared/:id", async (req, res) => {
  console.log("get/plan/shared");

  const { id } = req.params;

  const { creator } = await plansRdb.select({ id });

  if (req.username !== creator) {
    return res.sendStatus(403);
  }

  const accountPlanRdbResult = await accountPlanRdb.select({ planId: id });
  const sharedTo = await Promise.all(
    accountPlanRdbResult
      .filter((entry) => entry.sharedTo)
      .map(async (entry) => {
        const { username } = await accountRdb.select({ id: entry.accountId });
        return username;
      })
  );
  res.json(sharedTo);
});

apiRouter.post("/plan/toggle-shared/:planId?", async (req, res) => {
  console.log("post/plan/toggle-shared");

  const { planId } = req.params;
  const { username } = req.query;

  const { id: accountId } = await accountRdb.select({ username });
  const { creator } = await plansRdb.select({ id: planId });
  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId,
    planId,
  });

  if (req.username !== creator) {
    return res.sendStatus(403);
  }

  if (
    accountPlanRdbResult?.sharedTo &&
    !accountPlanRdbResult?.favourited &&
    !accountPlanRdbResult?.created
  ) {
    const result = await accountPlanRdb.del({ accountId, planId });
  } else {
    const result = await accountPlanRdb.insert({
      accountId,
      planId,
      sharedTo: !accountPlanRdbResult?.sharedTo,
      favourited: accountPlanRdbResult?.favourited,
    });
  }
  res.sendStatus(200);
});

apiRouter.post("/plan", async (req, res) => {
  console.log("post/plan");

  const { name, description, plan, isPublic } = req.body;

  const planId = uuidv4();

  const { id: accountId } = await accountRdb.select({ username: req.username });

  const cdbResult = await plansCdb.put(planId, plan);
  const plansRdbResult = await plansRdb.insert({
    id: planId,
    creator: req.username,
    name,
    description,
    product: plan.item,
    amount: plan.amount,
    isPublic,
  });
  const accountPlanRdbResult = await accountPlanRdb.insert({
    accountId,
    planId,
    created: true,
  });

  res.json({ planId }).status(201);
});

apiRouter.put("/plan/:id", async (req, res) => {
  console.log("put/plan");

  const { name, description, plan, isPublic } = req.body;
  const { id } = req.params;

  const rdbResult = await plansRdb.select({ id });
  const { id: accountId } = await accountRdb.select({ username: req.username });
  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId,
    planId: id,
  });

  if (!accountPlanRdbResult?.created && !accountPlanRdbResult?.sharedTo) {
    return res.sendStatus(403);
  }

  const cdbResult = await plansCdb.get(id);

  if (cdbResult && JSON.stringify(cdbResult) !== JSON.stringify(plan)) {
    const rev = await plansCdb.getRevision(id);
    const cdbResponse = await plansCdb.put(id, plan, rev);
  }

  const rdbResponse = await plansRdb.insert({
    id,
    creator: req.username,
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

  const accountPlanRdbResult = await accountPlanRdb.del({ planId: id });
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
