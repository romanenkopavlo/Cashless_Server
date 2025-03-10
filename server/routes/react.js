import {Router} from 'express';
import {addCard, getNewAccessToken, login, logout, signup, verifyBalance} from '../controllers/react.js';
import {authenticateJWT} from "../middleware/authMiddleware.js";

const routerReact = Router();

routerReact.post('/login', login);
routerReact.post('/signup', signup);
routerReact.post('/addCard', addCard);
routerReact.get('/logout', logout);
routerReact.get('/refreshToken', getNewAccessToken);
routerReact.get('/verifyBalance', authenticateJWT, verifyBalance);

export default routerReact;