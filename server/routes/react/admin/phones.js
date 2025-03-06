import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {createPhone, deletePhone, getPhones, updatePhone} from "../../../controllers/react/admin/crud/phones.js";

const routerPhones = Router();

routerPhones.get('/getPhones', authenticateAdminJWT, getPhones);
routerPhones.post('/createPhone', authenticateAdminJWT, createPhone);
routerPhones.post('/updatePhone', authenticateAdminJWT, updatePhone);
routerPhones.post('/deletePhone', authenticateAdminJWT, deletePhone);
export default routerPhones;