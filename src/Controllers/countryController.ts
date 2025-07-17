import { Request, Response } from "express";
import Country from "../db/Schemas/countrySchema";

export interface CountryType {
  name: string;
  code: string;
}

/**
 * Internal helper: returns countries as Map<string, CountryType>
 */
export const fetchCountriesAsMap = async (): Promise<
  Map<string, CountryType>
> => {
  const countries = await Country.find({}).select("-_id");
  return new Map(
    countries.map(({ name, code }: CountryType) => [name, { name, code }])
  );
};

/**
 * API controller: sends countries as JSON response
 */
export const getCountries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const countryMap = await fetchCountriesAsMap();
    res.status(200).json([...countryMap.values()]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to retrieve countries");
  }
};
