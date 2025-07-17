import express from "express";
import { getCountries } from "../Controllers/countryController";

const countryRoutes = express.Router();

countryRoutes.get("/", getCountries);

export { countryRoutes };
