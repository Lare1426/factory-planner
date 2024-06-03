import { executeQuery, updateSpecificFields } from "./rdb.js";

export const insert = async ({ id, username, password }) => {
  const [result] = await executeQuery(
    "INSERT INTO account (id, username, password) VALUES (?, ?, ?);",
    [id, username, password]
  );
  return result;
};

export const del = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM account WHERE id = ?;", [
    id,
  ]);
  return result;
};

export const update = ({ id, ...values }) => {
  return updateSpecificFields("account", id, ["username", "password"], values);
};

export const select = async ({ id, username }) => {
  const [[account]] = await executeQuery(
    `SELECT * FROM account WHERE ${id ? "id" : "username"} = ?`,
    [id ?? username]
  );
  return account;
};

export const selectAll = async () => {
  const [rows] = await executeQuery("SELECT * FROM account;");
  return rows;
};

export default { insert, del, update, select, selectAll };
