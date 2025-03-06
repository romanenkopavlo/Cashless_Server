import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {deleteCard, getCards} from "../../../controllers/react/admin/crud/cards.js";

const routerCards = Router();

routerCards.get('/getCards', authenticateAdminJWT, getCards);
routerCards.post('/deleteCard', authenticateAdminJWT, deleteCard);
export default routerCards;