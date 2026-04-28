import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { CustomJwtSessionClaims } from "@repo/types";

declare global {
    namespace Express {
        interface Request {
            userId: string
        }
    }
};

export const shouldBeUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = await getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    return res.status(401).json({ message: "You need to login first" });
  }
  req.userId = userId;
  return next();
};

export const shouldBeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = await getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    return res.status(401).json({ message: "You need to login first" });
  }

  const claims = auth.sessionClaims as CustomJwtSessionClaims;

  if (claims.metadata?.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized!" });
  }

  req.userId = userId;
  return next();
};
