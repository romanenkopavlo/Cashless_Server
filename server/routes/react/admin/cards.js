import {Router} from 'express';
import multer from 'multer';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {deleteCard, getCards, readFileCards} from "../../../controllers/react/admin/crud/cards.js";

const upload = multer({ dest: 'server/uploads/' });
const routerCards = Router();

routerCards.get('/getCards', authenticateAdminJWT, getCards);
routerCards.post('/deleteCard', authenticateAdminJWT, deleteCard);
routerCards.post('/readFileCards', upload.single('file'), authenticateAdminJWT, readFileCards);
export default routerCards;