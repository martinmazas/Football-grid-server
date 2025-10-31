import express from "express";
import playerController from "../Controllers/playerController";
const playerRoutes = express.Router();

playerRoutes.get("/guess", playerController.guessPlayer);
playerRoutes.get("/options", playerController.getPlayerOptions);

// For automation
playerRoutes.get("/", playerController.getPlayers);
playerRoutes.get("/image/:imgPath", playerController.getPlayerByImgPath);
playerRoutes.get("/imagePath", playerController.getPlayerImgFromDB);
playerRoutes.get("/:team", playerController.getPlayersByTeam);
playerRoutes.post(
  "/newPlayer",
  playerController.addPlayer,
  playerController.getPlayersByTeam
);
playerRoutes.put("/:id", playerController.modifyPlayer);
playerRoutes.delete(
  "/",
  playerController.deletePlayer,
  playerController.getPlayersByTeam
);

export { playerRoutes };
