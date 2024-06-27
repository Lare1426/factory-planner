import { executeQuery } from "./rdb.js";

export const insert = async ({
  accountId,
  planId,
  sharedTo = 0,
  favourited = 0,
  created = 0,
}) => {
  const [result] = await executeQuery(
    `INSERT INTO account_plan (accountId, planId, sharedTo, favourited, created) 
    VALUES (?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE sharedTo=?, favourited=?;`,
    [accountId, planId, sharedTo, favourited, created, sharedTo, favourited]
  );
  return result;
};

export const select = async ({ accountId, planId }) => {
  let result;
  if (accountId && planId) {
    [result] = await executeQuery(
      `SELECT * FROM account_plan WHERE accountId = ? AND planId = ?;`,
      [accountId, planId]
    );
  } else if (planId) {
    [result] = await executeQuery(
      "SELECT * FROM account_plan WHERE planId = ?;",
      [planId]
    );
  } else if (accountId) {
    [result] = await executeQuery(
      "SELECT * FROM account_plan WHERE accountId = ?;",
      [accountId]
    );
  }
  return result.map((row) => {
    row.sharedTo = !!row.sharedTo;
    row.favourited = !!row.favourited;
    row.created = !!row.created;
    return row;
  });
};

export const del = async ({ accountId, planId }) => {
  let result;
  if (accountId && planId) {
    [result] = await executeQuery(
      `DELETE FROM account_plan WHERE accountId = ? AND planId = ?;`,
      [accountId, planId]
    );
  } else if (planId) {
    [result] = await executeQuery(
      "DELETE FROM account_plan WHERE planId = ?;",
      [planId]
    );
  } else if (accountId) {
    [result] = await executeQuery(
      "DELETE FROM account_plan WHERE accountId = ?;",
      [accountId]
    );
  }
  return result;
};

export default { insert, select, del };
