import {Router} from 'express';
import {authenticateAndroidJWT} from "../middleware/authMiddlewareAndroid.js";
import {login} from "../controllers/android/connection.js";
import {crediter, debiter} from "../controllers/android/carte_operations.js";
import {products} from "../controllers/android/products.js";
import {stats} from "../controllers/android/stats.js";

const routerAndroid = Router();

routerAndroid.get('/products', authenticateAndroidJWT, products);

routerAndroid.post('/login', login);
routerAndroid.post('/stats', authenticateAndroidJWT, stats);
routerAndroid.post('/debit', authenticateAndroidJWT, debiter);
routerAndroid.post('/credit', authenticateAndroidJWT, crediter);

export default routerAndroid;