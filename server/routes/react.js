import {Router} from 'express';
import {addCard, getNewAccessToken, login, logout, verifyBalance} from '../controllers/react.js';
import {authenticateJWT} from "../middleware/authMiddleware.js";

const routerReact = Router();

routerReact.post('/login', login);
routerReact.post('/addCard', addCard);
routerReact.get('/logout', logout);
routerReact.get('/refreshToken', getNewAccessToken);
routerReact.get('/verifyBalance', authenticateJWT, verifyBalance);

export default routerReact;