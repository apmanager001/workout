"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Sparkles } from "lucide-react";

type WorkoutOption = {
  _id: string;
  name: string;
  slug: string;
  equipment: string[];
  targetMuscles: string[];
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

export function UserWorkoutManager({
  defaultDayOfWeek,
}: {
  defaultDayOfWeek?: number;
}) {
  const [workouts, setWorkouts] = useState<WorkoutOption[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(
    () => defaultDayOfWeek ?? new Date().getDay(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);

  const equipmentOptions = useMemo(() => {
    return Array.from(new Set(workouts.flatMap((workout) => workout.equipment)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [workouts]);

  const muscleOptions = useMemo(() => {
    return Array.from(
      new Set(workouts.flatMap((workout) => workout.targetMuscles)),
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return workouts.filter((workout) => {
      const matchesName = workout.name.toLowerCase().includes(query);
      const matchesEquipment =
        selectedEquipment === "all" ||
        workout.equipment.some(
          (equipment) => equipment.toLowerCase() === selectedEquipment,
        );
      const matchesMuscle =
        selectedMuscle === "all" ||
        workout.targetMuscles.some(
          (muscle) => muscle.toLowerCase() === selectedMuscle,
        );

      return (query === "" || matchesName) && matchesEquipment && matchesMuscle;
    });
  }, [workouts, searchQuery, selectedEquipment, selectedMuscle]);

  const selectedWorkoutId = useMemo(() => {
    if (
      selectedWorkout &&
      filteredWorkouts.some((workout) => workout._id === selectedWorkout)
    ) {
      return selectedWorkout;
    }

    return filteredWorkouts.length > 0 ? filteredWorkouts[0]._id : "";
  }, [filteredWorkouts, selectedWorkout]);

  useEffect(() => {
    void (async () => {
      setIsLoadingWorkouts(true);
      try {
        const response = await fetch("/api/workouts");
        if (!response.ok) {
          throw new Error("Unable to load workout options.");
        }
        const data = (await response.json()) as WorkoutOption[];
        setWorkouts(data);
        if (data.length > 0) {
          setSelectedWorkout((prevSelected) => prevSelected || data[0]._id);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoadingWorkouts(false);
      }
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/user-weekly-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutId: selectedWorkoutId,
          dayOfWeek: selectedDayOfWeek,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Unable to add workout.");
      }
      toast.success("Workout added to your schedule!");
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="search" className="space-y-2">
            <span className="text-sm text-base-content/70">
              Search workouts
            </span>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, muscle, or equipment"
              className="input w-full rounded-3xl border border-base-300/70 bg-base-100/90"
            />
          </label>

          <label htmlFor="equipment" className="space-y-2">
            <span className="text-sm text-base-content/70">Equipment</span>
            <select
              id="equipment"
              value={selectedEquipment}
              onChange={(event) => setSelectedEquipment(event.target.value)}
              disabled={isLoadingWorkouts}
              className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
            >
              <option value="all">All equipment</option>
              {equipmentOptions.map((equipment) => (
                <option key={equipment} value={equipment.toLowerCase()}>
                  {equipment}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="muscle" className="space-y-2">
            <span className="text-sm text-base-content/70">Target muscle</span>
            <select
              id="muscle"
              value={selectedMuscle}
              onChange={(event) => setSelectedMuscle(event.target.value)}
              disabled={isLoadingWorkouts}
              className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
            >
              <option value="all">All muscles</option>
              {muscleOptions.map((muscle) => (
                <option key={muscle} value={muscle.toLowerCase()}>
                  {muscle}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="dayOfWeek" className="space-y-2">
            <span className="text-sm text-base-content/70">Day of week</span>
            <select
              id="dayOfWeek"
              value={selectedDayOfWeek}
              onChange={(event) =>
                setSelectedDayOfWeek(Number(event.target.value))
              }
              className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
            >
              {DAY_NAMES.map((dayName, index) => (
                <option key={dayName} value={index}>
                  {dayName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr] items-end">
          <label htmlFor="workout" className="space-y-2">
            <span className="text-sm text-base-content/70">Workout</span>
            <select
              value={selectedWorkoutId}
              id="workout"
              onChange={(event) => setSelectedWorkout(event.target.value)}
              disabled={isLoadingWorkouts || filteredWorkouts.length === 0}
              className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
            >
              {filteredWorkouts.map((workout) => (
                <option key={workout._id} value={workout._id}>
                  {workout.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={isSaving || !selectedWorkoutId}
            className="btn btn-primary rounded-full px-6"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add workout
          </button>
        </div>
      </form>

      <p className="mt-3 text-sm text-base-content/70">
        {filteredWorkouts.length > 0
          ? `Showing ${filteredWorkouts.length} matching workout${
              filteredWorkouts.length === 1 ? "" : "s"
            }.`
          : "No workouts match those filters."}
      </p>

      {error ? (
        <p className="mt-4 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {/* <div className="mt-8">
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
      </div> */}
    </div>
  );
}
