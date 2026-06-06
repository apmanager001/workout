import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Clock3, Dumbbell, List } from "lucide-react";
import { getWorkoutBySlug } from "@/lib/backend/workouts";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const workout = await getWorkoutBySlug(params.slug);
  if (!workout) {
    return createPageMetadata({
      title: "Workout not found",
      description: "The requested workout could not be found.",
      path: `/workout/${params.slug}`,
    });
  }

  return createPageMetadata({
    title: workout.name,
    description: workout.description,
    path: `/workout/${params.slug}`,
  });
}

export default async function WorkoutPage({
  params,
}: {
  params: { slug: string };
}) {
  const workout = await getWorkoutBySlug(params.slug);
  if (!workout) {
    notFound();
  }

  return (
    <section className="section-shell py-10 lg:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Workout detail
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
            {workout.name}
          </h1>
          <p className="mt-5 max-w-2xl leading-8 text-base-content/70">
            {workout.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="badge badge-outline border-primary/20 bg-primary/5 text-primary">
              {workout.type} workout
            </span>
            <span className="badge badge-outline border-secondary/20 bg-secondary/5 text-secondary">
              {workout.equipment.join(", ")}
            </span>
          </div>
        </div>

        <Link
          href="/workouts"
          className="btn btn-ghost rounded-full border border-base-300/70 px-5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to catalog
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-8 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 text-base-content/70">
            <Dumbbell className="h-5 w-5" />
            <span>Equipment</span>
          </div>
          <p className="mt-4 text-lg font-semibold text-base-content">
            {workout.equipment.join(" • ")}
          </p>

          <div className="mt-8 flex items-center gap-3 text-base-content/70">
            <Activity className="h-5 w-5" />
            <span>Primary muscles</span>
          </div>
          <p className="mt-4 text-lg font-semibold text-base-content">
            {workout.targetMuscles.join(" • ")}
          </p>

          <div className="mt-8 flex items-center gap-3 text-base-content/70">
            <Clock3 className="h-5 w-5" />
            <span>Program notes</span>
          </div>
          <p className="mt-4 leading-7 text-base-content/75">
            This workout is ready to add to your schedule. The planner can later
            switch the logging form based on whether it&apos;s cardio or weight.
          </p>
        </div>
        <div className="rounded-3xl border border-base-300/70 bg-base-100/80 p-8 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 text-base-content/70">
            <List className="h-5 w-5" />
            <span>What to log</span>
          </div>
          <div className="mt-5 space-y-4 text-base-content/75">
            {workout.type === "weight" ? (
              <>
                <p>• Reps</p>
                <p>• Weight per set</p>
                <p>• Notes for each set</p>
              </>
            ) : (
              <>
                <p>• Minutes</p>
                <p>• Distance or rounds</p>
                <p>• Intensity notes</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
