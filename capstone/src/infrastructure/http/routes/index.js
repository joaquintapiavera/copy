import gameRoutes from './gameRoutes.js'
import userRoutes from './userRoutes.js'
import cardRoutes from './cardRoutes.js'
import scoreRoutes from './scoreRoutes.js'
import authRoutes from './authRoutes.js'
import endPointTrackRoutes from './endPointTrackRoutes.js'
import {Router} from "express";


const router = Router();

// Centralizing all application routes.

// This router mounts routes for the path
router.use('/users', userRoutes);
router.use('/games', gameRoutes);
router.use('/cards', cardRoutes);
router.use('/scores', scoreRoutes);
router.use('/auth', authRoutes);
router.use('/stats', endPointTrackRoutes);

export default router;

