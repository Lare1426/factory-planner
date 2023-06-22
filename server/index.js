import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { selectPerson } from "./utils/mysql.js";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

server.get("/person/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await selectPerson(id));
});

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
