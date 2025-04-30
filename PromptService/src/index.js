import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(cors());

app.use("/api/v1/prompt", require("./router/promptRouter"));

app.listen(port, () =>
    console.log(`Server running at http://localhost:${PORT}`),
);
