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

export const updateAccount = async ({ id, ...values }) => {
  const updateFields = [];
  const updateValues = [];

  for (const key of ["username", "password"]) {
    if (values[key]) {
      updateFields.push(`${key} = ?`);
      updateValues.push(values[key]);
    }
  }

  const [result] = await executeQuery(
    `UPDATE account SET ${updateFields.join(",")} WHERE id = ?;`,
    [...updateValues, id]
  );
  return result;
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

export const insertPlan = async ({
  id,
  name,
  description = null,
  product,
  amount,
  creator,
}) => {
  const [result] = await executeQuery(
    "INSERT INTO plan (id, name, description, product, amount, creator) VALUES (?, ?, ?, ?, ?, ?);",
    [id, name, description, product, amount, creator]
  );
  return result;
};

// console.log(
//   await insertPlan({
//     id: "lökjhjasdyu8",
//     name: "yes",
//     description: "no",
//     product: "yes",
//     amount: 400,
//     creator: "ohasdu",
//   })
// );
