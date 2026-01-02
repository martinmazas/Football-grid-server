import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { playerRoutes } from "./routes/playerRoutes";
import { paramsRoutes } from "./routes/paramsRoutes";
import { teamRoutes } from "./routes/teamRoutes";
import { countryRoutes } from "./routes/countryRoutes";
import { tournamentMiddleware } from "./middleware/tournament";
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    methods: ["GET", "POST"],
  })
);

// Routes
const apiRouter = express.Router();
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

export default app;