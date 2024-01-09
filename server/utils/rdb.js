import mysql from "mysql2/promise";

const connectionConfig = {
  database: "lare_factory-planner",
  host: "mysql-lare.alwaysdata.net",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

export const executeQuery = async (queryString, queryParams) => {
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
export const updateSpecificFields = async (
  tableName,
  id,
  fields,
  valuesObject
) => {
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
