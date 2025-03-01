import {Router} from 'express';
import {authenticateAdminJWT} from "../../../middleware/authMiddlewareAdmin.js";
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory
} from "../../../controllers/react/admin/crud/categories.js";

const routerCategories = Router();

routerCategories.get('/getCategories', authenticateAdminJWT, getCategories);
routerCategories.post('/createCategory', authenticateAdminJWT, createCategory);
routerCategories.post('/updateCategory', authenticateAdminJWT, updateCategory);
routerCategories.post('/deleteCategory', authenticateAdminJWT, deleteCategory);
export default routerCategories;