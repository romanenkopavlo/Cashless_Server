import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {
    createBenevole,
    deleteBenevole,
    getBenevoles,
    updateBenevole
} from "../../../controllers/react/admin/crud/benevoles.js";

const routerBenevoles = Router();

routerBenevoles.get('/getBenevoles', authenticateAdminJWT, getBenevoles);
routerBenevoles.post('/createBenevole', authenticateAdminJWT, createBenevole);
routerBenevoles.post('/updateBenevole', authenticateAdminJWT, updateBenevole);
routerBenevoles.post('/deleteBenevole', authenticateAdminJWT, deleteBenevole);
export default routerBenevoles;