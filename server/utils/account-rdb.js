import { executeQuery, updateSpecificFields } from "./rdb";

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
