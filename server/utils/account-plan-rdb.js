import { executeQuery, updateSpecificFields } from "./rdb.js";

export const insertAccountPlan = async ({
  accountId,
  planId,
  shared = 0,
  favourite = 0,
}) => {
  const [result] = await executeQuery(
    "INSERT INTO account-plan (accountId, planId, shared, favourite) VALUES (?, ?, ?, ?);",
    [accountId, planId, shared, favourite]
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
  return updateSpecificFields(
    "account-plan",
    id,
    ["name", "description", "product", "amount", "public"],
    values
  );
};
