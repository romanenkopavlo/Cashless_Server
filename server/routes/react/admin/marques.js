import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {createMarque, deleteMarque, getMarques, updateMarque} from "../../../controllers/react/admin/crud/marques.js";

const routerMarques = Router();

routerMarques.get('/getMarques', authenticateAdminJWT, getMarques);
routerMarques.post('/createMarque', authenticateAdminJWT, createMarque);
routerMarques.post('/updateMarque', authenticateAdminJWT, updateMarque);
routerMarques.post('/deleteMarque', authenticateAdminJWT, deleteMarque);
export default routerMarques;