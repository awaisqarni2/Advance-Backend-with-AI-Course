import express from "express";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: $`wellcome to our server` });
});

app.listen(port, (req, res) => {
  res.status(200).json({ message: `Server is Listing on port ${port}` });
});
