import { injectable } from "inversify";
import { interfaces } from "inversify-express-utils";
import express from "express";
import jwt from "jsonwebtoken";
import { Principal } from "./";
import { EnvironmentBase } from "..";

@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {
  // public async getUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<interfaces.Principal> {
  public async getUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Principal> {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (!token) return null;
      const decoded = jwt.verify(token, EnvironmentBase.jwtSecret);

      return decoded ? new Principal(decoded) : null;
    }

    return null;
  }
}
