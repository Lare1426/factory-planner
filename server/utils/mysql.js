import "dotenv/config";
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

export const selectPerson = async (id) => {
  const [rows] = await executeQuery("SELECT * FROM people WHERE id = ?;", [id]);
  return rows;
};

export const selectPeople = async () => {
  const [rows] = await executeQuery("SELECT * FROM people;");
  return rows;
};

export const insertPerson = async (name, age) => {
  const [result] = await executeQuery(
    "INSERT INTO people (name, age) VALUES (?, ?);",
    [name, age]
  );
  return result;
};

export const insertPeople = async (people) => {
  const flatPeople = people.reduce(
    (acc, person) => [...acc, person.name, person.age],
    []
  );

  const [result] = await executeQuery(
    `INSERT INTO people (name, age) VALUES ${people
      .map(() => "(?, ?)")
      .join(",")}`,
    flatPeople
  );
  return result;
};

export const updatePerson = async (values, id) => {
  const updateFields = Object.keys(values)
    .reduce((acc, key) => [...acc, `${key} = ?`], [])
    .join(",");

  const [result] = await executeQuery(
    `UPDATE people SET ${updateFields} WHERE id = ?;`,
    [...Object.values(values), id]
  );
  return result;
};

export const deletePerson = async (id) => {
  const [result] = await executeQuery("DELETE FROM people WHERE id = ?;", [id]);
  return result;
};
