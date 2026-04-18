import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export function signJwt(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: `${env.jwtExpiresInDays}d` });
}

export function verifyJwt(token) {
  return jwt.verify(token, env.jwtSecret);
}

