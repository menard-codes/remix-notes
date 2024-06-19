import { getSession } from "~/sessions";
import { redirect } from "@remix-run/node";
import { db } from "~/db/db.server";
import { EnvLoadingError, InvalidCredentialsError, UnauthorizedError } from "./errors.server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


export async function checkAuthentication(request: Request) {
      dotenv.config();
      const session = await getSession(request.headers.get("Cookie"));

      // 1.) Check if there's a jwt token
      const token = session.get("jwt");
      if (!token) {
        throw new UnauthorizedError("No JWT token found from the Cookie");
      }
    
      // 2.) Verify if the JWT token is valid (as sent by this server)
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
          throw new EnvLoadingError("Can't load JWT Secret from env");
      }
      // this will only return string if jwt is not valid
      const decoded = jwt.verify(token, jwtSecret);
      if (typeof decoded === "string") {
        throw new UnauthorizedError("Invalid JWT Token");
      }

      // 3.) After verifying the JWT, get the userId from the decoded payload and check if the user with that id exists
      // - There's a select statement to get the username of the matching user in the record
      const user = await db.users.findFirst({ where: { id: decoded.userId }, select: { username: true, id: true } });
      if (!user) {
        throw new InvalidCredentialsError("Credentials passed are invalid or incorrect");
      }

      // 4.) If all checks passed, return the user of the matching user in the record (only username and id)
      return user;
}

export async function checkIfAuthorizedAlready(request: Request) {
  try {
    const authenticatedUser = await checkAuthentication(request);
    if (authenticatedUser) {
      return redirect("/");
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof InvalidCredentialsError || error instanceof UnauthorizedError) {
      return null;
    }
  }
}

export async function signUp() {
}

export async function login() {
}

export async function logout() {
}
