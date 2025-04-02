import {Router} from 'express';
import {
    activateCard,
    addCard,
    getCardData,
    getNewAccessToken,
    login,
    logout,
    signup, updateProfile,
    verifyBalance
} from '../controllers/react.js';
import {authenticateJWT} from "../middleware/authMiddleware.js";

const routerReact = Router();

routerReact.post('/login', login);
routerReact.post('/signup', signup);
routerReact.get('/refreshToken', getNewAccessToken);
routerReact.get('/logout', logout);

routerReact.post('/updateProfile', authenticateJWT, updateProfile);
routerReact.post('/addCard', authenticateJWT, addCard);
routerReact.post('/activateCard', authenticateJWT, activateCard);
routerReact.get('/getCardData', authenticateJWT, getCardData);
routerReact.get('/verifyBalance', authenticateJWT, verifyBalance);
export default routerReact;