import { Request, Response, NextFunction } from "express";
import Player from "../db/Schemas/playerSchema";
import {
  filterCountriesPerTeam,
  writeLog,
  getCachedPlayers,
  normalize,
} from "../utils/functions";

const getPlayers = async (req: Request, res: Response) => {
  const params = req.body.params || "country team -_id";

  try {
    const players = await Player.find({}).select(params);
    writeLog(`Get players called`, req, "INFO");
    res.status(200).send(players);
  } catch (err: any) {
    writeLog(`${err} when calling Get players`, req, "ERROR");
    res.status(500).send(err);
  }
};

const guessPlayer = async (req: Request, res: Response) => {
  let { playerName, combinations } = req.query;
  let tournament = (req as any).tournament;

  if (tournament === "AFC CHAMPIONS LEAGUE") tournament = "AFC";
  if (!playerName)
    return res.send(
      "Player name is empty. Please provide a valid player's name."
    );

  try {
    const normalizedPlayerName = normalize(playerName as string).trim();
    const cachedPlayers = await getCachedPlayers(tournament);

    const possiblePlayers = cachedPlayers.filter((player: any) => {
      const fullName = `${player.first_name} ${player.second_name}`.trim();
      const normalizedFullName = normalize(fullName);
      return (
        normalizedFullName === normalizedPlayerName &&
        (combinations as string[]).includes(`${player.country}-${player.team}`)
      );
    });

    if (possiblePlayers.length >= 1) {
      const message = `${
        possiblePlayers.length > 1 ? "Multiple" : "One"
      } players found for ${playerName}`;
      writeLog(message, req, "INFO");
      return res.status(200).send(possiblePlayers);
    } else {
      return res.send("Player not found");
    }
  } catch (err: any) {
    console.error("Error in guessPlayer:", err);
    writeLog(err, req, "ERROR");
    return res.status(500).json({ error: "Server error in guessPlayer." });
  }
};

const getPlayerOptions = async (req: Request, res: Response) => {
  try {
    const { playerName } = req.query;
    let tournament = (req as any).tournament;
    if (tournament === "AFC CHAMPIONS LEAGUE") tournament = "AFC";

    const cachedPlayers = await getCachedPlayers(tournament);

    if (!cachedPlayers || cachedPlayers.length === 0) {
      writeLog("No players found in the cache", req, "INFO");
      return res.status(404).send("No players found in the cache");
    }

    if (!playerName) {
      return res.status(400).send("Player name is required");
    }

    const normalizedInput = normalize((playerName as string).trim());

    const matchingPlayers = cachedPlayers.filter(
      ({ first_name, second_name }: any) => {
        const fullName = `${first_name} ${second_name}`.trim();
        const normalizedFullName = normalize(fullName);
        const inputParts = normalizedInput.split(" ");

        return inputParts.every((inputPart) =>
          normalizedFullName
            .split(" ")
            .some((namePart) => namePart.startsWith(inputPart))
        );
      }
    );

    const playersToReturn = matchingPlayers.map(
      ({ first_name, second_name }: any) => ({
        first_name,
        second_name,
      })
    );

    return res.status(200).json(playersToReturn);
  } catch (err: any) {
    console.error("Error in getPlayerOptions:", err);
    return res.status(500).json({ error: "Server error in getPlayerOptions." });
  }
};

const getPlayersByTeam = async (req: Request, res: Response) => {
  const { team, type } = req.body;

  try {
    const data = await Player.find({ team });

    if (type === "Compare players") {
      const playerList = data.map((player: any) => ({
        name: `${player.first_name} ${player.second_name}`.trim(),
        country: player.country,
        team: player.team,
        img: player.imgPath,
      }));
      res.status(200).send(playerList);
    } else {
      const countries = data.map((player: any) => player.country);
      filterCountriesPerTeam(countries, team);
      res.status(200).send(`Countries have been updated for the team ${team}.`);
    }
  } catch (err: any) {
    console.log(err);
    res.status(500).send(err);
  }
};

const getPlayerByImgPath = async (req: Request, res: Response) => {
  const imgPath = req.params.imgPath.trim();
  const name = imgPath.split(" ").join(" ");

  try {
    const data = await Player.findOne({
      imgPath: new RegExp(`^\\s*${imgPath}\\s*$`, "i"),
    }).select("first_name second_name country team imgPath -_id");

    if (data) {
      res.status(200).send(`${data} found in DB`);
    } else {
      res.status(404).send(`${name} not found in DB`);
    }
  } catch (err: any) {
    res.status(500).send(err);
  }
};

const getPlayerImgFromDB = async (req: Request, res: Response, next: NextFunction) => {
  const params = req.body.params || "team imgPath -_id";
  const players = await Player.find({}).select(params);
  const imgPaths = players.map(player => {return {imgPath: player.imgPath.trim(), team: player.team}});
  
  res.status(200).json(imgPaths);
}

const addPlayer = async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, secondName, imgPath, country, team } = req.body;

  try {
    const existingPlayer = await Player.findOne({
      first_name: { $regex: `^${firstName}$`, $options: "i" },
      second_name: { $regex: `^${secondName}$`, $options: "i" },
      country,
      team,
    });

    if (existingPlayer) {
      const message = `Request to add ${firstName} ${secondName} was rejected. Player already exists in DB.`;
      writeLog(message, req, "INFO");
      return res
        .status(400)
        .send(`Player ${firstName} ${secondName} already exists in the DB.`);
    }

    const newPlayer = new Player({
      first_name: firstName,
      second_name: secondName,
      imgPath: imgPath.trim(),
      country,
      team,
    });

    await newPlayer.save();
    console.log(`Player ${firstName} ${secondName} added successfully.`);
    next();
  } catch (err: any) {
    const message = `${err.message} when trying to add ${firstName} ${secondName}`;
    writeLog(message, req, "ERROR");
    console.log("Failed to add the player.");
    res.status(500).send(err.message);
  }
};

const modifyPlayer = async (req: Request, res: Response) => {
  try {
    const data = await Player.find({});

    for (const player of data) {
      await Player.findByIdAndUpdate(player._id, {
        imgPath: `${player.first_name} ${player.second_name}`,
      })
        .then(() => {
          writeLog(
            `${player.first_name} ${player.second_name} from ${player.country} was updated successfully`,
            req,
            "INFO"
          );
        })
        .catch((err) => {
          writeLog(
            `${err} when trying to modify player ${player.first_name} ${player.second_name}`,
            req,
            "ERROR"
          );
        });
    }

    res.send("Players updated");
  } catch (err: any) {
    res.status(500).send(err);
  }
};

const deletePlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, firstName, secondName, country, team } = req.body;

  try {
    const data = await Player.findOneAndDelete({
      first_name: firstName || '',
      second_name: secondName,
      country,
      team,
    });

    if (data) {
      console.log({
        response: `Player ${firstName || ''} ${secondName} deleted successfully`,
        path: data?.imgPath,
      });
    } else {
      console.log(`Player ${name} not found`);
    }

    next();
  } catch (err: any) {
    res.status(500).send(err);
  }
};

const deletePlayerByTeam = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const players = await Player.deleteMany({ team: name });
    res
      .status(200)
      .send(`Players from ${name} were deleted from DB, ${players}`);
  } catch (err: any) {
    res.status(400).send(`${err}, when trying to delete multiple players`);
  }
};

export default {
  getPlayers,
  guessPlayer,
  getPlayerOptions,
  getPlayersByTeam,
  getPlayerByImgPath,
  addPlayer,
  modifyPlayer,
  deletePlayer,
  deletePlayerByTeam,
  getPlayerImgFromDB
};
