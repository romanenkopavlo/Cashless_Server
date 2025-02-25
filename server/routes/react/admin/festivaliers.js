import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {createFestivalier, deleteFestivalier, getFestivaliers, updateFestivalier} from "../../../controllers/react/admin/crud/festivaliers.js";

const routerFestivaliers = Router();

routerFestivaliers.get('/getFestivaliers', authenticateAdminJWT, getFestivaliers);
routerFestivaliers.post('/createFestivalier', authenticateAdminJWT, createFestivalier);
routerFestivaliers.post('/updateFestivalier', authenticateAdminJWT, updateFestivalier);
routerFestivaliers.post('/deleteFestivalier', authenticateAdminJWT, deleteFestivalier);
export default routerFestivaliers;