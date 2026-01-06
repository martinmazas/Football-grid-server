import express from "express";
import wordleController from "../Controllers/wordleController";
const wordleRoutes = express.Router();

wordleRoutes.post("/", wordleController.wordleLogs);

export { wordleRoutes };
