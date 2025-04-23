import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {getTransactions} from "../../../controllers/react/admin/crud/transactions.js";

const routerTransactions = Router();

routerTransactions.get('/getTransactions', authenticateAdminJWT, getTransactions);

export default routerTransactions;