import { PrismaClient } from "@prisma/client";

// TODO: Edit to separate prod env and dev env
export const db = new PrismaClient();
