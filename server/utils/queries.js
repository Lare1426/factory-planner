import { executeQuery } from "./rdb.js";

export const selectAccountPlans = async (accountId) => {
  let [rdbResult] = await executeQuery(
    `
    SELECT plan.name, plan.description, plan.id, plan.product, plan.amount, plan.isPublic, plan.creator, account_plan.sharedTo, account_plan.favourited, account_plan.created
    FROM account_plan 
    INNER JOIN plan
    ON account_plan.planId=plan.id
    WHERE account_plan.accountId=?;`,
    [accountId]
  );

  rdbResult = rdbResult.map((row) => {
    row.sharedTo = !!row.sharedTo;
    row.favourited = !!row.favourited;
    row.created = !!row.created;
    return row;
  });

  return rdbResult;
};

export const selectPlanMetadata = async (accountId, planId) => {
  const [[rdbResult]] = await executeQuery(
    `
    SELECT account_plan.sharedTo, account_plan.created, plan.isPublic
    FROM plan
    INNER JOIN account_plan
    ON plan.id=account_plan.planId
    WHERE account_plan.accountId=? AND account_plan.planId=?;`,
    [accountId, planId]
  );

  rdbResult.sharedTo = !!rdbResult.sharedTo;
  rdbResult.created = !!rdbResult.created;
  rdbResult.isPublic = !!rdbResult.isPublic;

  return rdbResult;
};
