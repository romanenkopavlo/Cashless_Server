import {Router} from 'express';
import {checkCard, crediter, debiter, login, products, stats} from '../controllers/android.js';
const routerAndroid = Router();

routerAndroid.get('/products', products)
routerAndroid.post('/stats', stats)
routerAndroid.post('/loginAd', login)
routerAndroid.post('/credit', crediter)
routerAndroid.post('/debit', debiter)
routerAndroid.post('/checkCard', checkCard)

export default routerAndroid;