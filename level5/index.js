import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({
    message: "wellcome to zentraelurex, website is in development phase...",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "All is good" });
});

app.listen(PORT, () => {
  console.log(`server is listen on ${PORT}`);
});
