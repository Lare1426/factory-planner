import { executeQuery, updateSpecificFields } from "./rdb.js";

export const insert = async ({
  id,
  name,
  description = null,
  product,
  amount,
  isPublic,
  creator,
}) => {
  const [result] = await executeQuery(
    `INSERT INTO plan (
      id, 
      name, 
      description, 
      product, 
      amount,
      isPublic, 
      creator
    ) VALUES (?, ?, ?, ?, ?, ?, ?) 
     ON DUPLICATE KEY UPDATE name=?, description=?, product=?, amount=?, isPublic=?;`,
    [
      id,
      name,
      description,
      product,
      amount,
      isPublic,
      creator,
      name,
      description,
      product,
      amount,
      isPublic,
    ]
  );
  return result;
};

export const select = async ({ id }) => {
  const [[plan]] = await executeQuery(`SELECT * FROM plan WHERE id = ?`, [id]);
  if (plan) {
    plan.isPublic = !!plan.isPublic;
  }
  return plan;
};

export const selectAll = async () => {
  const [rows] = await executeQuery("SELECT * FROM plan");
  return rows;
};

export const update = ({ id, values }) => {
  return updateSpecificFields(
    "plan",
    id,
    ["name", "description", "product", "amount", "isPublic"],
    values
  );
};

export const del = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM plan WHERE id = ?;", [id]);
  return result;
};

export default { insert, select, selectAll, update, del };
