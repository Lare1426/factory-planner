import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT ?? 3000;
const IP = process.env.IP;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

server.get("/plan/new/:product/:recipe?amount", async (req, res) => {
  const { product, recipe } = req.params;
  const { amount } = req.query;
});

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../client")));
}

server.listen(PORT, IP, () => {
  console.log("Listening to port", PORT);
});
