import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {deleteTerminal, getTerminals, updateTerminal} from "../../../controllers/react/admin/crud/terminals.js";

const routerTerminals = Router();

routerTerminals.get('/getTerminals', authenticateAdminJWT, getTerminals);
routerTerminals.post('/updateTerminal', authenticateAdminJWT, updateTerminal);
routerTerminals.post('/deleteTerminal', authenticateAdminJWT, deleteTerminal);
export default routerTerminals;