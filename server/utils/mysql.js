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
  const [[person]] = await executeQuery("SELECT * FROM people WHERE id = ?;", [
    id,
  ]);
  return person;
};

export const selectPeople = async () => {
  const [rows] = await executeQuery("SELECT * FROM people;");
  return rows;
};

export const insertPerson = async (person) => {
  const [result] = await executeQuery(
    "INSERT INTO people (name, age) VALUES (?, ?);",
    [person.name ?? null, person.age ?? null]
  );
  return result;
};

export const insertPeople = async (people) => {
  const flatPeople = people.reduce(
    (acc, person) => [...acc, person.name ?? null, person.age ?? null],
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
  const updateFields = [];
  const updateValues = [];

  for (const key of ["name", "age"]) {
    if (values[key]) {
      updateFields.push(`${key} = ?`);
      updateValues.push(values.key);
    }
  }

  const [result] = await executeQuery(
    `UPDATE people SET ${updateFields.join(",")} WHERE id = ?;`,
    [...updateValues, id]
  );
  return result;
};

export const deletePerson = async (id) => {
  const [result] = await executeQuery("DELETE FROM people WHERE id = ?;", [id]);
  return result;
};
