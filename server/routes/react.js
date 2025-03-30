import {Router} from 'express';
import {
    addCard,
    getCardData,
    getNewAccessToken,
    login,
    logout,
    signup,
    verifyBalance
} from '../controllers/react.js';
import {authenticateJWT} from "../middleware/authMiddleware.js";

const routerReact = Router();

routerReact.post('/login', login);
routerReact.post('/signup', signup);
routerReact.get('/refreshToken', getNewAccessToken);
routerReact.get('/logout', logout);

routerReact.post('/addCard', authenticateJWT, addCard);
routerReact.get('/getCardData', authenticateJWT, getCardData);
routerReact.get('/verifyBalance', authenticateJWT, verifyBalance);
export default routerReact;