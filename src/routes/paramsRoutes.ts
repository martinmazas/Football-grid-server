import express from "express";
import paramsController from "../Controllers/paramsController";
const paramsRoutes = express.Router();

// Get params when the game is started
paramsRoutes.get("/", paramsController.getParams);

export { paramsRoutes };
