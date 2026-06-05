"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";

type WeeklyLayoutWorkout = {
  _id: string;
  name: string;
  type: "weight" | "cardio";
};

type WeeklyLayoutDay = {
  dayOfWeek: number;
  workouts: WeeklyLayoutWorkout[];
};

type WeeklyLayoutResponse = {
  startDay: number;
  days: WeeklyLayoutDay[];
};

type WorkoutOption = {
  _id: string;
  name: string;
  slug: string;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function UserWorkoutManager() {
  const [layoutDays, setLayoutDays] = useState<WeeklyLayoutDay[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutOption[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);

  const assignedWorkouts = useMemo(() => {
    return layoutDays.flatMap((day) =>
      day.workouts.map((workout, index) => ({
        key: `${day.dayOfWeek}-${index}-${workout._id}`,
        dayOfWeek: day.dayOfWeek,
        workout,
      })),
    );
  }, [layoutDays]);

  async function fetchLayout() {
    setIsLoading(true);
    try {
      const startDay = new Date().getDay();
      const response = await fetch(
        `/api/user-weekly-layout?startDay=${startDay}`,
      );
      if (!response.ok) {
        throw new Error("Unable to load weekly layout.");
      }
      const data = (await response.json()) as WeeklyLayoutResponse;
      setLayoutDays(Array.isArray(data.days) ? data.days : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchWorkoutOptions() {
    setIsLoadingWorkouts(true);
    try {
      const response = await fetch("/api/workouts");
      if (!response.ok) {
        throw new Error("Unable to load workout options.");
      }
      const data = (await response.json()) as WorkoutOption[];
      setWorkouts(data);
      if (!selectedWorkout && data.length > 0) {
        setSelectedWorkout(data[0]._id);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingWorkouts(false);
    }
  }

  useEffect(() => {
    fetchLayout();
    fetchWorkoutOptions();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const parsedDate = new Date(`${date}T00:00:00`);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Please select a valid date.");
      }

      const response = await fetch("/api/user-weekly-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutId: selectedWorkout,
          dayOfWeek: parsedDate.getDay(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Unable to add workout.");
      }

      await fetchLayout();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="glass-panel rounded-3xl border border-base-300/70 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base-content/70">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-base-content">
            Weekly workout layout
          </h2>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 sm:grid-cols-[1.4fr_1fr]"
      >
        <label className="space-y-2">
          <span className="text-sm text-base-content/70">Workout</span>
          <select
            value={selectedWorkout}
            onChange={(event) => setSelectedWorkout(event.target.value)}
            disabled={isLoadingWorkouts}
            className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
          >
            {workouts.map((workout) => (
              <option key={workout._id} value={workout._id}>
                {workout.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-base-content/70">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="input w-full rounded-3xl border border-base-300/70 bg-base-100/90"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving || !selectedWorkout}
          className="btn btn-primary rounded-full px-6"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add workout
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        <h3 className="text-base font-semibold text-base-content">
          Current weekly assignments
        </h3>
        {isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-base-content/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading weekly assignments...
          </div>
        ) : assignedWorkouts.length === 0 ? (
          <p className="mt-4 text-base-content/70">No workouts assigned yet.</p>
        ) : (
          <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
            {assignedWorkouts.map((entry) => (
              <div
                key={entry.key}
                className="rounded-3xl border border-base-300/70 bg-base-100/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-base-content">
                      {entry.workout.name}
                    </p>
                    <p className="text-sm text-base-content/70">
                      {DAY_NAMES[entry.dayOfWeek]}
                    </p>
                  </div>
                  <span className="badge badge-outline rounded-full border-primary/20 bg-primary/5 text-primary">
                    {entry.workout.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
