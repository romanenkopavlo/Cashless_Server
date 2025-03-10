import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {createStand, deleteStand, getStands, updateStand} from "../../../controllers/react/admin/crud/stands.js";

const routerStands = Router();

routerStands.get('/getStands', authenticateAdminJWT, getStands);
routerStands.post('/createStand', authenticateAdminJWT, createStand);
routerStands.post('/updateStand', authenticateAdminJWT, updateStand);
routerStands.post('/deleteStand', authenticateAdminJWT, deleteStand);
export default routerStands;