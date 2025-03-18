import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {
    affecterBenevole,
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
routerBenevoles.post('/affecterBenevole', authenticateAdminJWT, affecterBenevole);

export default routerBenevoles;