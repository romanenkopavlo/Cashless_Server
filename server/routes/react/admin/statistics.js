import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {getStatistics} from "../../../controllers/react/admin/crud/statistics.js";

const routerStatistics = Router();

routerStatistics.get('/getStatistics', authenticateAdminJWT, getStatistics);

export default routerStatistics;