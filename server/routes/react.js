import {Router} from 'express';
import {authenticateJWT} from "../middleware/authMiddleware.js";
import {getNewAccessToken, login, logout, signup, updateProfile} from "../controllers/react/users/connection.js";
import {activateCard, addCard, getCardData} from "../controllers/react/users/gestion_carte.js";

const routerReact = Router();

routerReact.post('/login', login);
routerReact.post('/signup', signup);
routerReact.get('/refreshToken', getNewAccessToken);
routerReact.get('/logout', logout);

routerReact.post('/updateProfile', authenticateJWT, updateProfile);
routerReact.post('/addCard', authenticateJWT, addCard);
routerReact.post('/activateCard', authenticateJWT, activateCard);
routerReact.get('/getCardData', authenticateJWT, getCardData);

export default routerReact;