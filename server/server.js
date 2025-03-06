import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import routerReact from './routes/react.js';
import routerAndroid from './routes/android.js';
import mysqlPool from "./config/db.js";
import routerStands from "./routes/react/admin/stands.js";
import routerFestivaliers from "./routes/react/admin/festivaliers.js";
import routerBenevoles from "./routes/react/admin/benevoles.js";
import routerCategories from "./routes/react/admin/categories.js";
import routerTransactions from "./routes/react/admin/transactions.js";
import routerCards from "./routes/react/admin/cards.js";
import routerPhones from "./routes/react/admin/phones.js";
import routerMarques from "./routes/react/admin/marques.js";
import routerTerminals from "./routes/react/admin/terminals.js";

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

app.use('/api/admin/cards', routerCards);
app.use('/api/admin/phones', routerPhones);
app.use('/api/admin/stands', routerStands);
app.use('/api/admin/marques', routerMarques);
app.use('/api/admin/terminals', routerTerminals);
app.use('/api/admin/benevoles', routerBenevoles);
app.use('/api/admin/categories', routerCategories);
app.use('/api/admin/transactions', routerTransactions);
app.use('/api/admin/festivaliers', routerFestivaliers);

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
