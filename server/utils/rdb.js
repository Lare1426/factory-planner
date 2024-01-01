import mysql from "mysql2/promise";

const connectionConfig = {
  database: "lare_factory-planner",
  host: "mysql-lare.alwaysdata.net",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

const executeQuery = async (queryString, queryParams) => {
  const connection = await mysql.createConnection(connectionConfig);
  const result = await connection.execute(queryString, queryParams);
  connection.end();
  return result;
};

/**
 * @param {string} tableName
 * @param {string} id - unique id of row to update
 * @param {string[]} fields - possible fields to update
 * @param {object} valuesObject - keys are fields which represent values to update with
 * @returns {mysql.ResultSetHeader[]}
 */
const updateSpecificFields = async (tableName, id, fields, valuesObject) => {
  const updateFields = [];
  const updateValues = [];

  for (const field of fields) {
    if (valuesObject.hasOwn(field)) {
      updateFields.push(`${field} = ?`);
      updateValues.push(valuesObject[field]);
    }
  }

  const [result] = await executeQuery(
    `UPDATE ${tableName} SET ${updateFields.join(",")} WHERE id = ?;`,
    [...updateValues, id]
  );
  return result;
};

// account

export const insertAccount = async ({ id, username, password }) => {
  const [result] = await executeQuery(
    "INSERT INTO account (id, username, password) VALUES (?, ?, ?);",
    [id, username, password]
  );
  return result;
};

export const deleteAccount = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM account WHERE id = ?;", [
    id,
  ]);
  return result;
};

export const updateAccount = ({ id, ...values }) => {
  return updateSpecificFields("account", id, ["username", "password"], values);
};

export const selectAccount = async ({ id, username }) => {
  const [[account]] = await executeQuery(
    `SELECT * FROM account WHERE ${id ? "id" : "username"} = ?`,
    [id ?? username]
  );
  return account;
};

export const selectAccounts = async () => {
  const [rows] = await executeQuery("SELECT * FROM account;");
  return rows;
};

// plan

export const insertPlan = async ({
  id,
  name,
  description = null,
  product,
  amount,
  creator,
}) => {
  const [result] = await executeQuery(
    `INSERT INTO plan (
      id, 
      name, 
      description, 
      product, 
      amount, 
      creator
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [id, name, description, product, amount, creator]
  );
  return result;
};

export const selectPlan = async ({ id }) => {
  const [[plan]] = await executeQuery(`SELECT * FROM plan WHERE id = ?`, [id]);
  return plan;
};

export const selectPlans = async () => {
  const [rows] = await executeQuery("SELECT * FROM plan");
  return rows;
};

export const updatePlan = ({ id, ...values }) => {
  return updateSpecificFields(
    "plan",
    id,
    ["name", "description", "product", "amount"],
    values
  );
};

export const deletePlan = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM plan WHERE id = ?;", [id]);
  return result;
};

// account plan

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
