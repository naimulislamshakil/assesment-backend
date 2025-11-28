import express from 'express';
import {
	getUser,
	login,
	logout,
	register,
} from '../controllers/userControllers';
import { isAuthenticated } from '../middlewares/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', isAuthenticated, getUser);
router.get('/logout', isAuthenticated, logout);

export default router;
