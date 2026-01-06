import { Request, Response } from "express";
import { writeLog } from "../utils/functions";

const wordleLogs = async (req: Request, res: Response) => {
  const message = "New wordle game requested";
  writeLog(message, req, 'INFO');
};

export default {
  wordleLogs,
};
