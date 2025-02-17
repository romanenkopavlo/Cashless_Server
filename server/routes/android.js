import {Router} from 'express';
import {checkCard, login, products} from '../controllers/android.js';
const routerAndroid = Router();

routerAndroid.post('/loginAd', login)
routerAndroid.post('/products', products)
routerAndroid.post('/checkCard', checkCard)

// routerAndroid.post('/loginUs')

export default routerAndroid;