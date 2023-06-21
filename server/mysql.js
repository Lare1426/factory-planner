import "dotenv";
import mysql from "mysql2/promise";

const connect = async () => {
  const connection = await mysql.createConnection({
    database: "lare_factory-planner",
    host: "mysql-lare.alwaysdata.net",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  const [rows, fields] = await connection.execute("select ?+? as sum", [2, 2]);
  console.log("file: mysql.js:13 ~ fields:", fields);
  console.log("file: mysql.js:13 ~ rows:", rows);
};

connect();
