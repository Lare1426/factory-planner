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
  authenticateToken,
  authenticateTokenMiddleware,
} from "./utils/authorize.js";
import plansCdb from "./utils/plans-db.js";
import plansRdb from "./utils/plan-rdb.js";
import accountPlanRdb from "./utils/account-plan-rdb.js";
import accountRdb from "./utils/account-rdb.js";
import {
  selectAccountPlans,
  selectPlanUserMetadata,
  selectSharedPlans,
} from "./utils/queries.js";

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

apiRouter.get("/plan/:planId", async (req, res) => {
  console.log("get/plan/id");

  const { planId } = req.params;
  const plan = await plansRdb.select(planId);
  if (!plan) {
    return res.sendStatus(404);
  }

  const { name, description, isPublic, creator } = plan;

  let hasEditAccess = false;
  let isFavourite = false;

  const user = authenticateToken(req);
  if (user) {
    const planUserMetadata = await selectPlanUserMetadata(user.id, planId);

    if (planUserMetadata) {
      if (planUserMetadata.shared || planUserMetadata.created) {
        hasEditAccess = true;
      }
      if (planUserMetadata.favourited) {
        isFavourite = true;
      }
    }
    if (!isPublic && !hasEditAccess) {
      return res.sendStatus(403);
    }
  }

  if (!isPublic && !hasEditAccess) {
    return res.sendStatus(401);
  }

  const planJson = await plansCdb.get(planId);

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

apiRouter.post("/plan/toggle-favourite/:planId", async (req, res) => {
  console.log("post/plan/toggle-favourite");

  const { planId } = req.params;

  const plan = await plansRdb.select(planId);
  if (!plan) {
    return res.sendStatus(404);
  }

  const planUserMetadata = await selectPlanUserMetadata(req.user.id, planId);
  if (planUserMetadata) {
    if (
      !plan.isPublic &&
      !planUserMetadata.created &&
      !planUserMetadata.shared
    ) {
      return res.sendStatus(403);
    }

    if (
      !planUserMetadata.shared &&
      planUserMetadata.favourited &&
      !planUserMetadata.created
    ) {
      await accountPlanRdb.del({ accountId: req.user.id, planId });
      return res.sendStatus(200);
    }
  }

  await accountPlanRdb.upsert({
    accountId: req.user.id,
    planId,
    shared: planUserMetadata?.shared,
    favourited: !planUserMetadata?.favourited,
  });

  res.sendStatus(200);
});

apiRouter.get("/plan/shared/:planId", async (req, res) => {
  console.log("get/plan/shared");

  const { planId } = req.params;

  const { creator } = await plansRdb.select(planId);

  if (req.user.name !== creator) {
    return res.sendStatus(403);
  }

  const accountPlanRdbResult = await accountPlanRdb.select({ planId: planId });
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
    await accountPlanRdb.upsert({
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

  const planMetadata = await selectPlanUserMetadata(req.user.id, planId);

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
  await plansRdb.upsert({
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

apiRouter.put("/plan/:planId", async (req, res) => {
  console.log("put/plan");

  const { name, description, plan, isPublic } = req.body;
  const { planId } = req.params;

  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId: req.user.id,
    planId: planId,
  });

  if (!accountPlanRdbResult?.created && !accountPlanRdbResult?.shared) {
    return res.sendStatus(403);
  }

  const cdbResult = await plansCdb.get(planId);

  if (cdbResult && JSON.stringify(cdbResult) !== JSON.stringify(plan)) {
    const rev = await plansCdb.getRevision(planId);
    const cdbResponse = await plansCdb.put(planId, plan, rev);
  }

  const rdbResponse = await plansRdb.upsert({
    planId,
    creator: req.user.name,
    name,
    description,
    product: plan.item,
    amount: plan.amount,
    isPublic,
  });

  res.sendStatus(200);
});

apiRouter.delete("/plan/:planId", async (req, res) => {
  console.log("delete/plan");

  const { planId } = req.params;

  const [accountPlanRdbResult] = await accountPlanRdb.select({
    accountId: req.user.id,
    planId: planId,
  });

  if (!accountPlanRdbResult.created) {
    res.sendStatus(403);
  }

  await accountPlanRdb.del({ planId: planId });
  await plansRdb.del({ planId });
  await plansCdb.del(planId);
  res.sendStatus(200);
});

apiRouter.get("/account/plan", async (req, res) => {
  console.log("get/account/plan");

  const accountPlans = await selectAccountPlans(req.user.id);
  const sharedPlans = await selectSharedPlans(req.user.id);

  accountPlans.forEach((plan) => {
    if (plan.created) {
      plan.sharedTo = sharedPlans[plan.id] ?? [];
    }
    return plan;
  });

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
