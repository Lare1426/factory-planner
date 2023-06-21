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

const selectPeople = async () => {
  const connection = await connect();
  [rows] = await connection.query("SELECT * FROM people;");
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
  people.map((person) => {
    if (person.length === 1) {
      if (typeof person[0] === "string") {
        return;
      }
    }
  });
  const connection = await connect();
  const [result] = await connection.execute(
    `INSERT INTO people (name, age) VALUES ${people
      .map(() => "(?, ?)")
      .join(",")}`,
    people.flat()
  );
  return result;
};

const updatePeople = async (values, condition) => {
  const connection = await connect();
  [rows] = await connection.execute("UPDATE people SET ? WHERE ?;", [
    values,
    condition,
  ]);
  return rows;
};

const deletePeople = async (condition) => {
  const connection = await connect();
  [rows] = await connection.execute("DELETE FROM people WHERE ?;", condition);
  return rows;
};
