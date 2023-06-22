import "dotenv/config";
import mysql from "mysql2/promise";

const connect = async () => {
  return mysql.createConnection({
    database: "lare_factory-planner",
    host: "mysql-lare.alwaysdata.net",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
};

const selectPerson = async (id) => {
  const connection = await connect();
  const [rows] = await connection.execute(
    "SELECT * FROM people WHERE id = ?;",
    [id]
  );
  return rows;
};

const selectPeople = async () => {
  const connection = await connect();
  const [rows] = await connection.query("SELECT * FROM people;");
  return rows;
};

const insertPerson = async (name, age) => {
  const connection = await connect();
  const [result] = await connection.execute(
    "INSERT INTO people (name, age) VALUES (?, ?);",
    [name, age]
  );
  return result;
};

const insertPeople = async (people) => {
  const flatPeople = people.reduce(
    (acc, person) => [...acc, person.name, person.age],
    []
  );

  const connection = await connect();
  const [result] = await connection.execute(
    `INSERT INTO people (name, age) VALUES ${people
      .map(() => "(?, ?)")
      .join(",")}`,
    flatPeople
  );
  return result;
};

const updatePerson = async (values, id) => {
  const updateFields = Object.keys(values)
    .reduce((acc, key) => [...acc, `${key} = ?`], [])
    .join(",");

  const connection = await connect();
  const [result] = await connection.execute(
    `UPDATE people SET ${updateFields} WHERE id = ?;`,
    [...Object.values(values), id]
  );
  return result;
};

const deletePerson = async (id) => {
  const connection = await connect();
  const [result] = await connection.execute(
    "DELETE FROM people WHERE id = ?;",
    [id]
  );
  return result;
};
