import { executeQuery, updateSpecificFields } from "./rdb.js";

export const insert = async ({
  accountId,
  planId,
  shared = 0,
  favourite = 0,
}) => {
  const [result] = await executeQuery(
    "INSERT INTO account_plan (accountId, planId, shared, favourite) VALUES (?, ?, ?, ?);",
    [accountId, planId, shared, favourite]
  );
  return result;
};

export const del = async ({ accountId, planId }) => {
  const [result] = await executeQuery(
    "DELETE FROM account_plan WHERE accountId = ? AND planId = ?;",
    [accountId, planId]
  );
  return result;
};

export const update = async ({ accountId, planId, type }) => {
  const [result] = await executeQuery(
    "UPDATE account_plan SET type = ? WHERE accountId = ? AND planId = ?;",
    [type, accountId, planId]
  );
  return result;
  // return updateSpecificFields(
  //   "account_plan",
  //   id,
  //   ["name", "description", "product", "amount", "public"],
  //   values
  // );
};

export default { insert, del, update };
