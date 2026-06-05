import type { Metadata } from "next";
import { requireServerSession } from "@/lib/backend/auth/session";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Settings",
  description:
    "Manage your workout preferences, notification settings, and account profile.",
  path: "/settings",
  noIndex: true,
});

export default async function SettingsPage() {
  const session = await requireServerSession();

  return (
    <section className="section-shell py-10 lg:py-14">
      <div className="glass-panel rounded-3xl border border-base-300/70 p-8 shadow-xl shadow-primary/5">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Account settings
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
            Personalize your workout experience.
          </h1>
          <p className="max-w-3xl leading-7 text-base-content/70">
            Update profile details, training preferences, and notification
            settings for your workout log.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-6">
            <h2 className="text-lg font-semibold text-base-content">Profile</h2>
            <p className="mt-3 text-base-content/70">
              Signed in as{" "}
              <span className="font-medium text-base-content">
                {session.user.email}
              </span>
              .
            </p>
          </div>
          <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-6">
            <h2 className="text-lg font-semibold text-base-content">
              Workout preferences
            </h2>
            <p className="mt-3 text-base-content/70">
              Choose between cardio and strength-focused logging forms, and set
              your default training split.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
