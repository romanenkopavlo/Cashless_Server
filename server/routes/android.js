import {Router} from 'express';
import {checkCard, crediter, debiter, login, products} from '../controllers/android.js';
const routerAndroid = Router();

routerAndroid.post('/loginAd', login)
routerAndroid.post('/products', products)
routerAndroid.post('/credit', crediter)
routerAndroid.post('/debit', debiter)
routerAndroid.post('/checkCard', checkCard)

// routerAndroid.post('/loginUs')

export default routerAndroid;