import { executeQuery } from "./rdb.js";

export const selectAccountPlans = async (accountId) => {
  let [rdbResult] = await executeQuery(
    `
    SELECT 
      plan.name,
      plan.description,
      plan.id,
      plan.product,
      plan.amount,
      plan.isPublic,
      plan.creator,
      account_plan.shared,
      account_plan.favourited,
      account_plan.created
    FROM account_plan 
    INNER JOIN plan 
      ON account_plan.planId=plan.id
    WHERE account_plan.accountId=?;
    `,
    [accountId]
  );

  return rdbResult.map((row) => {
    row.shared = !!row.shared;
    row.favourited = !!row.favourited;
    row.created = !!row.created;
    return row;
  });
};

export const selectSharedPlans = async (accountId) => {
  const [rdbResult] = await executeQuery(
    `
    SELECT B.planId, account.username
    FROM account_plan AS A, account_plan AS B
    INNER JOIN account
      ON B.accountId=account.id
    WHERE A.accountId=? AND A.created=1 AND B.planId=A.planId AND B.shared=1;
    `,
    [accountId]
  );

  return rdbResult.reduce((acc, { planId, username }) => {
    if (!acc[planId]) {
      acc[planId] = [username];
    } else {
      acc[planId].push(username);
    }
    return acc;
  }, {});
};
