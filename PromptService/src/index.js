const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 9010;

app.use(express.json());
app.use(cors());

app.use("/api/v1/prompt", require("./router/promptRouter"));

app.listen(port, () =>
    console.log(`Server running at http://localhost:${PORT}`),
);
