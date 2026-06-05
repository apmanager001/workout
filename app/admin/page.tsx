import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/backend/auth/session";
import { createPageMetadata } from "@/lib/seo/metadata";
import { ArrowRight, Palette, Pencil } from "lucide-react";
import { AdminWorkoutManager } from "@/components/admin/admin-workout-manager";
import Link from "next/link";

export const metadata: Metadata = createPageMetadata({
  title: "Admin",
  description:
    "Admin workspace for managing the workout library and workout templates.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  await requireAdminSession();

  return (
    <section className="section-shell py-10 lg:py-14">
      <div className="glass-panel rounded-3xl border border-base-300/70 p-8 shadow-xl shadow-primary/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              Admin dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
              Manage the workout library.
            </h1>
          </div>
          <Link href="/workouts" className="btn btn-outline rounded-full px-6">
            <ArrowRight className="mr-2 h-4 w-4" />
            Browse workouts
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-3xl border border-base-300/70 bg-base-100/80 p-6">
            <div className="flex items-center gap-3 text-base-content/70">
              <Palette className="h-5 w-5" />
              <span>Exercise library</span>
            </div>
            <p className="mt-4 text-base-content/70">
              Add new movements, update descriptions, and control which workouts
              appear in the planner.
            </p>
          </article>
          <article className="rounded-3xl border border-base-300/70 bg-base-100/80 p-6">
            <div className="flex items-center gap-3 text-base-content/70">
              <Pencil className="h-5 w-5" />
              <span>Edit workouts</span>
            </div>
            <p className="mt-4 text-base-content/70">
              Create templates for weight training, cardio, and hybrid sessions
              so the user can quickly add them to days.
            </p>
          </article>
          <article className="rounded-3xl border border-base-300/70 bg-base-100/80 p-6">
            <div className="flex items-center gap-3 text-base-content/70">
              <ArrowRight className="h-5 w-5" />
              <span>Future features</span>
            </div>
            <p className="mt-4 text-base-content/70">
              This page is ready to become a working CRUD admin area once the
              workout model and backend editing API are added.
            </p>
          </article>
        </div>
      </div>

      <AdminWorkoutManager />
    </section>
  );
}
