import { createCookieSessionStorage } from "@remix-run/node";

import dotenv from "dotenv";
dotenv.config();

interface SessionData {
    jwt: string;
}

interface SessionFlashData {
    error: string;
}

if (!process.env.COOKIE_SECRETS) {
    throw new Error('Cookie Secrets not defined in the environment variables. Check the env');
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
        name: "__session",
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax",
        secrets: process.env.COOKIE_SECRETS.split(',')
    }
});

export { getSession, commitSession, destroySession };
