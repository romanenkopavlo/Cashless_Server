import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {getTransactions} from "../../../controllers/react/admin/crud/transactions.js";
import {refundTransaction} from "../../../controllers/react/admin/operations/transactions.js";

const routerTransactions = Router();

routerTransactions.get('/getTransactions', authenticateAdminJWT, getTransactions);
routerTransactions.post('/refundTransaction', authenticateAdminJWT, refundTransaction);

export default routerTransactions;