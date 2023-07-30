import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  deletePerson,
  insertPeople,
  insertPerson,
  selectPeople,
  selectPerson,
  updatePerson,
} from "./utils/mysql.js";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

server.use(express.json());

server.get("/person/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await selectPerson(id));
});

server.get("/people", async (req, res) => {
  res.json(await selectPeople());
});

server.post("/person", async (req, res) => {
  res.json(await insertPerson(req.body));
});

server.post("/people", async (req, res) => {
  res.json(await insertPeople(req.body));
});

server.patch("/person/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await updatePerson(req.body, id));
});

server.delete("/person/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await deletePerson(id));
});

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
