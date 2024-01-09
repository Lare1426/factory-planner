import { executeQuery, updateSpecificFields } from "./rdb.js";

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

// console.log(await selectPlans());

export const updatePlan = ({ id, ...values }) => {
  return updateSpecificFields(
    "plan",
    id,
    ["name", "description", "product", "amount"],
    values
  );
};

console.log(await updatePlan("lkhnna", { name: "bad plan" }));

export const deletePlan = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM plan WHERE id = ?;", [id]);
  return result;
};
