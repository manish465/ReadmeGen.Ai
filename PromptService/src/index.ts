import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import promptRouters from './routers/promptRouters';

const app: express.Application = express();
dotenv.config();

app.use(cors());
app.use(express.json());

const port: string = process.env.PORT || '3000';

app.use("/api/v1/prompt", promptRouters);

app.listen(port, () => console.log("Server is running in http://localhost:" + port));