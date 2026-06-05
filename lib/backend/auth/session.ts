import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const getServerSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

function getAuthUserId(
  session: Exclude<Awaited<ReturnType<typeof getServerSession>>, null>,
) {
  return session.user.id ?? session.user.email ?? "";
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const authUserId = getAuthUserId(session);
  if (!authUserId || !(session.user as any)?.admin) {
    redirect("/");
  }

  return session;
}
