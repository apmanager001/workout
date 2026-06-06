"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/components/ui/format";

type WorkoutInfo = {
  _id: string;
  slug?: string;
  name: string;
  type: string;
};

type WeightSet = {
  reps: number;
  weight: number;
};

type WorkoutLog = {
  _id: string;
  workoutId: string | WorkoutInfo;
  type: "weight" | "cardio";
  date: string;
  intensity: number;
  notes?: string;
  sets?: WeightSet[];
  duration?: string;
};

export default function Page() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("all");

  useEffect(() => {
    let isCancelled = false;

    fetch("/api/workout-logs?limit=500")
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to load workout logs.");
        }
        return response.json();
      })
      .then((data: WorkoutLog[]) => {
        if (isCancelled) {
          return;
        }
        setLogs(data);
      })
      .catch((err) => {
        if (isCancelled) {
          return;
        }
        setError((err as Error).message);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const workoutOptions = useMemo(() => {
    const seen = new Map<string, WorkoutInfo>();

    logs.forEach((log) => {
      const workout =
        typeof log.workoutId === "object"
          ? log.workoutId
          : {
              _id: log.workoutId,
              name: `Workout ${log.workoutId.slice(0, 6)}`,
              type: log.type,
            };

      if (workout._id && !seen.has(workout._id)) {
        seen.set(workout._id, workout);
      }
    });

    return Array.from(seen.values());
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (selectedWorkoutId === "all") {
      return logs;
    }

    return logs.filter((log) => {
      const workout =
        typeof log.workoutId === "object" ? log.workoutId._id : log.workoutId;
      return workout === selectedWorkoutId;
    });
  }, [logs, selectedWorkoutId]);

   const INTENSITY_LABELS: Record<number, string> = {
     0: "Light",
     25: "Moderate",
     50: "Hard",
     75: "Very Hard",
     100: "Max",
   };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-base-300/70 bg-base-100/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
              Workout log history
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-base-content">
              Workout logs
            </h1>
          </div>

          <div className="w-full max-w-sm sm:w-auto">
            <label className="space-y-2">
              <span className="text-sm text-base-content/70">
                Filter by workout
              </span>
              <select
                value={selectedWorkoutId}
                onChange={(event) => setSelectedWorkoutId(event.target.value)}
                className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
              >
                <option value="all">All workouts</option>
                {workoutOptions.map((workout) => (
                  <option key={workout._id} value={workout._id}>
                    {workout.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-6 text-base-content/70">
          Loading workout logs...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-error/20 bg-error/10 p-6 text-sm text-error">
          {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-6 text-base-content/70">
          No workout logs found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const workout =
              typeof log.workoutId === "object" ? log.workoutId : null;
            const workoutName = workout?.name ?? "Unknown workout";
            const workoutType = workout?.type ?? log.type;

            return (
              <div
                key={log._id}
                className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-2">
                    <p className="text-xl font-semibold text-base-content">
                      {workoutName}
                    </p>
                    <p className="text-sm text-base-content/60">
                      {formatDate(log.date)} • {workoutType}
                    </p>
                  </div>
                  <div className="flex-1 w-full rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                    <label htmlFor="intensity" className="label">
                      <span className="label-text text-sm uppercase tracking-[0.24em] text-base-content/50">
                        Intensity
                      </span>
                    </label>
                    <input
                      type="range"
                      id="intensity"
                      min={0}
                      max={100}
                      step={25}
                      value={log.intensity}
                      className="range cursor-not-allowed range-primary"
                      readOnly
                    />
                    <div className="flex justify-between px-2.5 mt-2 text-xs">
                      <span>|</span>
                      <span>|</span>
                      <span>|</span>
                      <span>|</span>
                      <span>|</span>
                    </div>
                    <div className="flex justify-between px-2.5 mt-2 text-xs">
                      <span>Light</span>
                      <span>Moderate</span>
                      <span>Hard</span>
                      <span>Very Hard</span>
                      <span>Max</span>
                    </div>
                    <div className="mt-3 text-center text-sm font-semibold text-primary">
                      {INTENSITY_LABELS[log.intensity]}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
                  {log.type === "weight" ? (
                    <div className="rounded-3xl border border-base-300/70 bg-base-100 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                        Weight sets
                      </p>
                      <div className="mt-3 space-y-2">
                        {log.sets?.map((set, index) => (
                          <div
                            key={`set-${index}`}
                            className="flex items-center justify-between rounded-2xl bg-base-200/50 p-3"
                          >
                            <span className="text-sm text-base-content">
                              Set {index + 1}
                            </span>
                            <span className="text-sm text-base-content/70">
                              {set.reps} reps • {set.weight} lbs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-base-300/70 bg-base-100 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                        Cardio duration
                      </p>
                      <p className="mt-3 text-base-content">
                        {log.duration ?? "—"} Minutes
                      </p>
                    </div>
                  )}

                  <div className="rounded-3xl border border-base-300/70 bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                      Notes
                    </p>
                    <p className="mt-3 text-base-content">
                      {log.notes?.trim() || "No notes added."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
