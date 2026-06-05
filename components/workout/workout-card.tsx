import Link from "next/link";
import { ArrowRight, Dumbbell, Flame, Sparkles } from "lucide-react";
import type { Workout } from "@/lib/workouts/data";

export function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-base-300/60 bg-base-100/75 p-6 shadow-xl shadow-primary/5 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-base-100/95">
      <div className="flex items-center justify-between gap-3">
        <span className="badge badge-outline badge-lg rounded-full border-primary/20 bg-primary/5 text-primary">
          {workout.type === "weight" ? (
            <Dumbbell className="mr-2 inline-block h-4 w-4" />
          ) : (
            <Flame className="mr-2 inline-block h-4 w-4" />
          )}
          {workout.type}
        </span>
        <span className="rounded-full bg-base-200 px-3 py-1 text-xs uppercase tracking-[0.24em] text-base-content/60">
          {workout.targetMuscles.join(", ")}
        </span>
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-base-content">
        {workout.name}
      </h2>
      <p className="mt-4 text-sm leading-7 text-base-content/70">
        {workout.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-base-content/55">
        {workout.equipment.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-base-300/70 bg-base-200/80 px-3 py-2"
          >
            {tool}
          </span>
        ))}
      </div>

      <Link
        href={`/workout/${workout.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        View workout
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
