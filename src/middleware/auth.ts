import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized: Missing authentication token" 
        });
      }
      if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1]; 
      };
      const decoded = jwt.verify(
        token as string,
        config.jwtSecret as string
      ) as JwtPayload;
      req.user = decoded;
      if (roles.length) {
        const isAdmin   = decoded.role === "admin";
        const isSameUser = String(decoded.id) === String(req.params.id);

        if (!isAdmin && !isSameUser) {
          return res.status(403).json({
            success: false,
            message: "Forbidden: You can only access your own data!",
          });
        }
      }
      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

export default auth;