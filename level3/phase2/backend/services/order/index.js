import express from "express";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: `wellcome from order service` });
});

app.listen(port, () => {
  console.log(`Server is Listing on port ${port}`);
});
