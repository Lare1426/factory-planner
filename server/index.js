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
import {
  selectAccountPlans,
  selectPlanMetadata,
  selectSharedPlans,
} from "./utils/queries.js";
import { readdir } from "fs";

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
    const token = generateToken(username, account.id);
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

  const user = auhtenticateToken(req);
  if (user) {
    const planMetadata = await selectPlanMetadata(user.id, id);
    if (
      !planMetadata.isPublic &&
      !planMetadata?.created &&
      !planMetadata?.shared
    ) {
      return res.sendStatus(req.user?.name ? 403 : 401);
    }
    if (planMetadata?.shared || planMetadata.created) {
      hasEditAccess = true;
    }
    if (planMetadata?.favourited) {
      isFavourite = true;
    }
  }

  if (!isPublic && !hasEditAccess) {
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

  res.json(req.user.name).status(200);
});

apiRouter.get("/plan/favourite/:id", async (req, res) => {
  console.log("get/plan/favourite");

  const { id } = req.params;

  const planMetadata = await selectPlanMetadata(req.user.id, id);

  if (
    !planMetadata.isPublic &&
    !planMetadata?.shared.created &&
    !planMetadata?.shared
  ) {
    return res.sendStatus(403);
  }

  if (!planMetadata) {
    return res.sendStatus(404);
  }

  res.json({ favourite: planMetadata.favourited });
});

apiRouter.post("/plan/toggle-favourite/:planId", async (req, res) => {
  console.log("post/plan/toggle-favourite");

  const { planId } = req.params;

  const planMetadata = await selectPlanMetadata(req.user.id, planId);

  if (
    !planMetadata.isPublic &&
    !planMetadata.created &&
    !planMetadata?.shared
  ) {
    return res.sendStatus(403);
  }

  if (
    !planMetadata?.shared &&
    planMetadata?.favourited &&
    !planMetadata?.created
  ) {
    accountPlanRdb.del({ accountId: req.user.id, planId });
  } else {
    const result = await accountPlanRdb.insert({
      accountId: req.user.id,
      planId,
      shared: planMetadata?.shared,
      favourited: !planMetadata?.favourited,
    });
  }
  res.sendStatus(200);
});

apiRouter.get("/plan/shared/:id", async (req, res) => {
  console.log("get/plan/shared");

  const { id } = req.params;

  const { creator } = await plansRdb.select({ id });

  if (req.user.name !== creator) {
    return res.sendStatus(403);
  }

  const accountPlanRdbResult = await accountPlanRdb.select({ planId: id });
  const sharedTo = await Promise.all(
    accountPlanRdbResult
      .filter((entry) => entry.shared)
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
  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId,
    planId,
  });

  if (
    accountPlanRdbResult?.shared &&
    !accountPlanRdbResult?.favourited &&
    !accountPlanRdbResult?.created
  ) {
    await accountPlanRdb.del({ accountId, planId });
  } else {
    await accountPlanRdb.insert({
      accountId,
      planId,
      shared: !accountPlanRdbResult?.shared,
      favourited: accountPlanRdbResult?.favourited,
    });
  }
  res.sendStatus(200);
});

apiRouter.post("/plan/toggle-isPublic/:planId", async (req, res) => {
  console.log("/post/plan/toggle-isPublic");

  const { planId } = req.params;

  const planMetadata = await selectPlanMetadata(req.user.id, planId);

  if (planMetadata.shared || planMetadata.created) {
    await plansRdb.update({
      id: planId,
      values: { isPublic: !planMetadata.isPublic },
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

apiRouter.post("/plan", async (req, res) => {
  console.log("post/plan");

  const { name, description, plan, isPublic } = req.body;

  const planId = uuidv4();

  await plansCdb.put(planId, plan);
  await plansRdb.insert({
    id: planId,
    creator: req.user.name,
    name,
    description,
    product: plan.item,
    amount: plan.amount,
    isPublic,
  });
  await accountPlanRdb.insert({
    accountId: req.user.id,
    planId,
    created: true,
  });

  res.json({ planId }).status(201);
});

apiRouter.put("/plan/:id", async (req, res) => {
  console.log("put/plan");

  const { name, description, plan, isPublic } = req.body;
  const { id } = req.params;

  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId: req.user.id,
    planId: id,
  });

  if (!accountPlanRdbResult?.created && !accountPlanRdbResult?.shared) {
    return res.sendStatus(403);
  }

  const cdbResult = await plansCdb.get(id);

  if (cdbResult && JSON.stringify(cdbResult) !== JSON.stringify(plan)) {
    const rev = await plansCdb.getRevision(id);
    const cdbResponse = await plansCdb.put(id, plan, rev);
  }

  const rdbResponse = await plansRdb.insert({
    id,
    creator: req.user.name,
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
  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId: req.user.id,
    planId: id,
  });

  if (!accountPlanRdbResult.created) {
    res.sendStatus(403);
  }

  await accountPlanRdb.del({ planId: id });
  await plansRdb.del({ id });
  await plansCdb.del(id);
  res.sendStatus(200);
});

apiRouter.get("/account/plan", async (req, res) => {
  console.log("get/account/plan");

  const accountPlans = await selectAccountPlans(req.user.id);
  const SharedPlans = await selectSharedPlans(req.user.id);

  accountPlans.map((plan) => {
    plan.sharedTo = SharedPlans[plan.id] ?? [];
    return plan;
  });
  7;
  res.json({
    public: accountPlans.filter((plan) => plan.created && plan.isPublic),
    private: accountPlans.filter((plan) => plan.created && !plan.isPublic),
    favourited: accountPlans.filter((plan) => plan.favourited),
    shared: accountPlans.filter((plan) => plan.shared),
  });
});

server.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
