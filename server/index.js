import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  getDocument,
  updateDocument,
  createDocument,
  deleteDocument,
} from "./utils/couchdb.js";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

server.use(express.json());

server.get("/doc/:id", async (req, res) => {
  const { id } = req.params;

  const document = await getDocument(id);
  res.json(document);
});

server.put("/doc/:id", async (req, res) => {
  const { id } = req.params;
  const { rev, ...document } = req.body;

  let result;
  if (rev) {
    result = await updateDocument(id, document, rev);
  } else {
    result = await createDocument(id, document);
  }

  res.json(result);
});

server.put("/doc/update/:id", async (req, res) => {
  const { id } = req.params;
  const document = req.body;

  const result = await updateDocument(id, document);
  res.json(result);
});

server.delete("/doc/:id", async (req, res) => {
  const { id } = req.params;
  const { rev } = req.query;

  const result = await deleteDocument(id, rev);
  res.json(result);
});

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
