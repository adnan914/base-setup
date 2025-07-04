import express, { Router } from 'express';
import userRoutes from './user.routes';
const router: Router = express.Router();

router.use('/users', userRoutes);

// Export the router
export default router;
