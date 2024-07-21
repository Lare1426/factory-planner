import { getCurrentTimeDate } from "./dates.js";
import { executeQuery, updateSpecificFields } from "./rdb.js";

export const upsert = async ({
  id,
  name,
  description = null,
  product,
  amount,
  isPublic,
  creationTime,
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
      creationTime,
      creator
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE name=?, description=?, product=?, amount=?, isPublic=?;`,
    [
      id,
      name,
      description,
      product,
      amount,
      isPublic,
      creationTime,
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

export const select = async (id) => {
  const [[plan]] = await executeQuery(`SELECT * FROM plan WHERE id = ?`, [id]);
  if (plan) {
    plan.isPublic = !!plan.isPublic;
    plan.creationDate = getCurrentTimeDate(plan.creationTime);
  }
  return plan;
};

export const update = ({ id, values }) => {
  return updateSpecificFields(
    "plan",
    id,
    ["name", "description", "product", "amount", "isPublic", "views"],
    values
  );
};

export const del = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM plan WHERE id = ?;", [id]);
  return result;
};

export default { upsert, select, update, del };
