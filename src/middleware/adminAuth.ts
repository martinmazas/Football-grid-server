import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const provided = req.headers["x-admin-key"];

  if (typeof provided !== "string") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const expected = Buffer.from(adminKey);
  const actual = Buffer.from(provided);

  if (
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(expected, actual)
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};
