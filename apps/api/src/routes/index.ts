import express, {Router} from 'express';
import playerRoutes from './playerRoutes';
import tournamentRoutes from './tournamentRoutes';
import matchRoutes from './matchRoutes';
import stageRoutes from './stageRoutes';
import {ENDPOINT} from "@repo/lib";

const router:Router = express.Router();

// Mount routes
router.use(ENDPOINT.PLAYERS, playerRoutes);
router.use(ENDPOINT.TOURNAMENTS, tournamentRoutes);
router.use('/matches', matchRoutes);
router.use('/stages', stageRoutes);

export default router;