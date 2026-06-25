import express from "express";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: `server is runing on ${port}` });
});

app.listen(port, (req, res) => {
  console.log(`server is in runing on port ${port}`);
});
