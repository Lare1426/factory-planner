import { executeQuery } from "./rdb";

export const insertAccountPlan = async ({ accountId, planId, type }) => {
  const [result] = await executeQuery(
    "INSERT INTO account-plan (accountId, planId, type) VALUES (?, ?, ?);",
    [accountId, planId, type]
  );
  return result;
};

export const deleteAccountPlan = async ({ accountId, planId }) => {
  const [result] = await executeQuery(
    "DELETE FROM account-plan WHERE accountId = ? AND planId = ?;",
    [accountId, planId]
  );
  return result;
};

export const updateAccountPlan = async ({ accountId, planId, type }) => {
  const [result] = await executeQuery(
    "UPDATE account-plan SET type = ? WHERE accountId = ? AND planId = ?;",
    [type, accountId, planId]
  );
  return result;
};
