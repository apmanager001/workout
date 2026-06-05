import type { Metadata } from "next";
import { WorkoutCard } from "@/components/workout/workout-card";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getAllWorkouts } from "@/lib/backend/workouts";

export const metadata: Metadata = createPageMetadata({
  title: "Workouts",
  description:
    "Browse the workout library with training details, equipment, and target muscles for every routine.",
  path: "/workouts",
});

export default async function WorkoutsPage() {
  const workouts = await getAllWorkouts();

  return (
    <section className="section-shell py-10 lg:py-14">
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Workout library
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
          Explore every workout in the training catalog.
        </h1>
        <p className="mx-auto max-w-2xl text-base-content/70 sm:text-lg">
          Each exercise includes the movement type, tools needed, and the
          primary muscles it targets so you can plan the right training day.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.slug} workout={workout} />
        ))}
      </div>
    </section>
  );
}
