import { Request, Response, NextFunction } from "express";

export interface TournamentRequest extends Request {
  tournament?: string;
}

export const tournamentMiddleware = (
  req: TournamentRequest,
  res: Response,
  next: NextFunction
) => {
  const tournament =
    req.query.tournament?.toString() ||
    req.body.tournament?.toString() ||
    req.headers["tournament"]?.toString();

  const validTournaments: string[] = (process.env.VALID_TOURNAMENTS || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!tournament) {
    return res.status(400).json({ error: "Tournament parameter is required" });
  }

  if (!validTournaments.includes(tournament)) {
    console.warn(
      `Invalid tournament received: ${tournament} from ${
        req.headers["user-agent"]
      }, ${req.headers["x-forwarded-for"] || req.connection.remoteAddress}`
    );
    return res.status(400).json({ error: "Invalid tournament parameter" });
  }

  // Attach the tournament to the request object, so it's accessible in the routes
  req.tournament = tournament;
  next();
};
