import { executeQuery } from "./rdb.js";

export const insert = async ({
  accountId,
  planId,
  shared = 0,
  favourite = 0,
}) => {
  const [result] = await executeQuery(
    `INSERT INTO account_plan (accountId, planId, shared, favourite) 
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE shared=?, favourite=?;`,
    [accountId, planId, shared, favourite, shared, favourite]
  );
  return result;
};

export const select = async ({ accountId, planId }) => {
  let result;
  if (!accountId) {
    [result] = await executeQuery(
      "SELECT * FROM account_plan WHERE planId = ?;",
      [planId]
    );
  } else if (!planId) {
    [result] = await executeQuery(
      "SELECT * FROM account_plan WHERE accountId = ?;",
      [accountId]
    );
  } else {
    [[result]] = await executeQuery(
      `SELECT * FROM account_plan WHERE accountId = ? AND planId = ?;`,
      [accountId, planId]
    );
  }
  return result;
};

export const del = async ({ accountId, planId }) => {
  const [result] = await executeQuery(
    "DELETE FROM account_plan WHERE accountId = ? AND planId = ?;",
    [accountId, planId]
  );
  return result;
};

export default { insert, select, del };
