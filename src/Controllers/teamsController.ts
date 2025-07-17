import { Request, Response, NextFunction } from "express";
import Team from "../db/Schemas/teamSchema";
import { getTournamentTeams } from "../utils/functions";

const getTeams = async (req: Request, res: Response) => {
  const tournament = (req as any).tournament;
  if (tournament === "AFC CHAMPIONS LEAGUE")
    return res.status(200).send(await getTournamentTeams("AFC"));
  res.status(200).send(await getTournamentTeams(tournament));
};

const addTeam = async (req: Request, res: Response) => {
  try {
    const { name, code, url, tournament } = req.body;

    const existingTeam = await Team.findOne({ name });

    if (existingTeam) {
      if (existingTeam.tournaments.includes(tournament)) {
        return res
          .status(200)
          .send(`${name} already exists with tournament ${tournament}`);
      }

      await Team.updateOne(
        { name },
        { $addToSet: { tournaments: tournament } }
      );
      return res.status(200).send(`Tournament ${tournament} added to ${name}`);
    }

    const newTeam = new Team({
      name,
      code,
      url,
      countries: [],
      tournaments: [tournament],
    });

    await newTeam.save();
    return res
      .status(200)
      .send(`Team ${name} was successfully added to the DB`);
  } catch (err: any) {
    return res
      .status(400)
      .send(`Error: ${err} when trying to add ${req.body.name}`);
  }
};

const removeTeam = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  Team.findOneAndDelete({ name })
    .then((team) => {
      console.log(`${name} removed successfully`);
      next();
    })
    .catch((err) =>
      res.status(400).send(`${err}, when trying to remove ${name}`)
    );
};

const removeTournamentFromTeam = async (req: Request, res: Response) => {
  try {
    const tournament = (req as any).tournament;
    const { team } = req.body;

    const updatedTeam = await Team.findOneAndUpdate(
      { name: team },
      { $pull: { tournaments: tournament } },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({
      message: `Tournament "${tournament}" removed from team "${team}"`,
      tournamentsLeft: updatedTeam.tournaments.length,
    });
  } catch (error) {
    console.error("Error removing tournament:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  getTeams,
  addTeam,
  removeTeam,
  removeTournamentFromTeam,
};
