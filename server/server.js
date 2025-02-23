import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import routerReact from './routes/react.js';
import routerAndroid from './routes/android.js';
import mysqlPool from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;
const corsOption = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', routerReact);
app.use('/api/android', routerAndroid);

app.get('/', (req, res) => {
    res.json({message: 'Cashless'})
});

app.listen(port, () => {
    console.log(`Lancé sur le http://localhost:${port}`);
});

console.log('mysql host: ', process.env.DB_HOST);
console.log('mysql user: ', process.env.DB_USER);
console.log('mysql database: ', process.env.DB_DATABASE);

mysqlPool.query('SELECT 1').then(() => {
    console.log('MysqlPool query returning it\'s ok ');
}).catch((err) => {
    console.log('MysqlPool query returning ' + err);
});
