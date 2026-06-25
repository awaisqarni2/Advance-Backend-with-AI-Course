import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

//http://localhost:8000
app.use("/auth", proxy("http://auth-service:8001"));
app.use("/order", proxy("http://order-service:8002"));
app.use("/product", proxy("http://product-service:8003"));

app.get("/", (req, res) => {
  res.status(200).json({ message: `wellcome from ${process.env.SERVER_NAME}` });
});

app.listen(port, () => {
  console.log(`Server is Listing on port ${port}`);
});
