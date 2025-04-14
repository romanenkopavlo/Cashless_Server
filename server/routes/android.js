import {Router} from 'express';
import {checkCard, crediter, debiter, login, products, stats} from '../controllers/android.js';
import {authenticateAndroidJWT} from "../middleware/authMiddlewareAndroid.js";
const routerAndroid = Router();

routerAndroid.get('/products', products)
routerAndroid.post('/stats', stats)
routerAndroid.post('/loginAd', login)
routerAndroid.post('/credit', authenticateAndroidJWT, crediter)
routerAndroid.post('/debit', debiter)
routerAndroid.post('/checkCard', checkCard)

export default routerAndroid;