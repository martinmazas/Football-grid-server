import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import DB from "./db/DBconnection";
import { playerRoutes } from "./routes/playerRoutes";
import { paramsRoutes } from "./routes/paramsRoutes";
import { teamRoutes } from "./routes/teamRoutes";
import { countryRoutes } from "./routes/countryRoutes";
dotenv.config();

interface TournamentRequest extends Request {
  tournament?: string;
}

// Middleware to ensure the 'tournament' parameter is included in every request
const tournamentMiddleware = (
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

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    methods: ["GET", "POST"],
  })
);
const apiRouter = express.Router();

// Routes
apiRouter.use(tournamentMiddleware);
apiRouter.use("/parameters", paramsRoutes);
apiRouter.use("/players", playerRoutes);
apiRouter.use("/teams", teamRoutes);
apiRouter.use("/countries", countryRoutes);

app.use("/api", apiRouter);
// Fallback route
app.use("/api/*", (req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

app.listen(PORT, "0.0.0.0", async () => {
  let uri = process.env.MONGO_URI!;
  const db = new DB(uri);
  await db.connectToDB();
  console.log(`Server running on port ${PORT}`);
});
