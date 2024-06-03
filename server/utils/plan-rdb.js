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
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [id, name, description, product, amount, isPublic, creator]
  );
  return result;
};

export const select = async ({ id }) => {
  const [[plan]] = await executeQuery(`SELECT * FROM plan WHERE id = ?`, [id]);
  return plan;
};

export const selectAll = async () => {
  const [rows] = await executeQuery("SELECT * FROM plan");
  return rows;
};

// export const selectExists = async ({ id }) => {
//   const [[row]] = await executeQuery(
//     "SELECT * FROM plan WHERE EXISTS (SELECT * FROM plan WHERE id = ?)",
//     [id]
//   );
//   console.log(row);
// };

// selectExists({ id: "5459f124-6a18-45fc-ab04-7ba125032e18" });

export const update = ({ id, values }) => {
  return updateSpecificFields(
    "plan",
    id,
    ["name", "description", "product", "amount", "public"],
    values
  );
};

export const del = async ({ id }) => {
  const [result] = await executeQuery("DELETE FROM plan WHERE id = ?;", [id]);
  return result;
};

export default { insert, select, selectAll, update, del };
