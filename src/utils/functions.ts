import { fetchCountriesAsMap } from "../Controllers/countryController";
import Player from "../db/Schemas/playerSchema";
import Team from "../db/Schemas/teamSchema";
import { Request } from "express";

interface TeamType {
  name: string;
  code: string;
  url: string;
  countries: string[];
}

interface CountryType {
  name: string;
  code: string;
}

let cachedCountries: Map<string, CountryType>;
const teamCache: Record<string, TeamType[]> = {};
const playerCache: Record<string, any[]> = {};

const loadInitialData = async () => {
  try {
    cachedCountries = await fetchCountriesAsMap();
    console.log('Countries data loaded successfully');
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
};

(async () => {
  await loadInitialData();
})(); // Ensure data is loaded before proceeding

// Function used to get random countries/teams (when calling from params)
const getRandomElements = (
  requiredElements: number,
  elements: any[]
): any[] => {
  const result = new Set<any>();
  const len = elements.length;

  // Get req. elements - 1
  while (result.size < requiredElements - 1) {
    const rand = Math.floor(Math.random() * len);
    result.add(elements[rand]);
  }

  return Array.from(result);
};

// Get all the possible countries for a specific combination of teams
const getPossibleCountries = (teams: TeamType[]): CountryType[] => {
  if (!teams) return [];
  const possibleCountries = teams.flatMap((team) => team.countries);
  return possibleCountries
    .map((country) => cachedCountries.get(country))
    .filter(Boolean) as CountryType[];
};

const getCachedCountries = (randomCountries: string[]): CountryType[] => {
  return randomCountries
    .map((country) => cachedCountries.get(country))
    .filter(Boolean) as CountryType[];
};

const writeLog = async (
  message: string,
  req: Request,
  type: string
): Promise<void> => {
  const ua = req.headers["user-agent"];
  const ip =
    (req.headers["x-forwarded-for"] as string) ||
    (req.connection?.remoteAddress ?? "unknown");

  try {
    console.log(`IP: ${ip}, UA: ${ua}. -> ${message}`);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
};

const filterCountriesPerTeam = async (
  countries: string[],
  team: string
): Promise<void> => {
  const countriesSet = [...new Set(countries)];

  try {
    await Team.findOneAndUpdate(
      { name: team },
      { $set: { countries: countriesSet } },
      { new: true }
    );
    console.log(`New update on ${team}`);
  } catch (err) {
    console.error(err);
  }
};

const getTournamentTeams = async (
  tournament: string,
  rows = 1
): Promise<TeamType[]> => {
  try {
    if (teamCache[tournament]) return teamCache[tournament];

    const teams = (await Team.find({
      tournaments: tournament,
      $expr: { $gte: [{ $size: "$countries" }, rows - 1] },
    }).select("-_id -__v -tournaments")) as TeamType[];

    teamCache[tournament] = teams;
    playerCache[tournament] = [];

    for (const team of teams) {
      Player.find({ team: team.name })
        .select("-_id")
        .then((players) => {
          playerCache[tournament].push(...players);
        });
    }

    return teams;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getCachedPlayers = (tournament: string): any[] => {
  return playerCache[tournament] || [];
};

const normalize = (str: string): string => {
  return str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";
};

const getTeamsUrl = async (): Promise<TeamType[]> => {
  const teams = Team.find({}).select('name url -_id');
  return teams;
}

export {
  getRandomElements,
  getPossibleCountries,
  getCachedCountries,
  writeLog,
  filterCountriesPerTeam,
  getTournamentTeams,
  getCachedPlayers,
  normalize,
  getTeamsUrl
};
