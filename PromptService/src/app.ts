import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import promptRouters from './routers/promptRouters';

const app: express.Application = express();
dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/api/v1/prompt', promptRouters);

export { app };
