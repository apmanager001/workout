import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession } from "better-auth/plugins";
import {
  connectMongoClient,
  getMongoClient,
  getMongoDatabase,
} from "./lib/backend/mongodb/client";
import { connectMongoose } from "./lib/backend/mongoose/connection";
import { UserProfileModel } from "./lib/backend/mongoose/schemas/user-profile";


const fallbackAuthSecret =
  "foundry-stack-dev-secret-change-me-before-production-2026";

const mongoClient = getMongoClient();

void connectMongoClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? fallbackAuthSecret,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
  database: mongodbAdapter(getMongoDatabase(), {
    client: mongoClient,
    usePlural: true,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    customSession(async (session) => {
      const authUserId = session.user.id ?? session.user.email ?? "";

      if (!authUserId) {
        return session;
      }

      await connectMongoose();

      const profile = await UserProfileModel.findOne({ authUserId }).lean();
      const sessionUser = session.user as Record<string, unknown>;
      const sessionRoles = Array.isArray(sessionUser.roles)
        ? sessionUser.roles.filter((role): role is string => typeof role === "string")
        : undefined;

      return {
        ...session,
        user: {
          ...session.user,
          admin: Boolean(profile?.admin),
          roles: profile?.roles ?? sessionRoles ?? ["member"],
        },
      };
    }),
  ],
});
