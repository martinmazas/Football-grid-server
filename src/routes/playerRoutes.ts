import express from "express";
import playerController from "../Controllers/playerController";
import { requireAdmin } from "../middleware/adminAuth";
const playerRoutes = express.Router();

playerRoutes.get("/guess", playerController.guessPlayer);
playerRoutes.get("/surrender", playerController.surrenderPlayer);
playerRoutes.get("/options", playerController.getPlayerOptions);

// For automation
playerRoutes.get("/", requireAdmin, playerController.getPlayers);
playerRoutes.get(
  "/image/:imgPath",
  requireAdmin,
  playerController.getPlayerByImgPath
);
playerRoutes.get(
  "/imagePath",
  requireAdmin,
  playerController.getPlayerImgFromDB
);
playerRoutes.get("/:team", requireAdmin, playerController.getPlayersByTeam);
playerRoutes.post(
  "/newPlayer",
  requireAdmin,
  playerController.addPlayer,
  playerController.getPlayersByTeam
);
playerRoutes.put("/:id", requireAdmin, playerController.modifyPlayer);
playerRoutes.delete(
  "/",
  requireAdmin,
  playerController.deletePlayer,
  playerController.getPlayersByTeam
);

export { playerRoutes };
