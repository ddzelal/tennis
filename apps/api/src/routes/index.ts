import express, { Router } from "express";
import playerRoutes from "./playerRoutes";
import tournamentRoutes from "./tournamentRoutes";
import matchRoutes from "./matchRoutes";
import stageRoutes from "./stageRoutes";
import { ENDPOINT } from "@repo/lib";

const router: Router = express.Router();

// Mount routes
router.use(ENDPOINT.PLAYERS, playerRoutes);
router.use(ENDPOINT.TOURNAMENTS, tournamentRoutes);
router.use(ENDPOINT.MATCHES, matchRoutes);
router.use(ENDPOINT.STAGES, stageRoutes);

export default router;
