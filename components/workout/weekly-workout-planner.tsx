"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, GripVertical, Info, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/components/ui/format";
import { ModalPortal } from "@/components/ui/portal";
import { UserWorkoutManager } from "@/components/workout/user-workout-manager";
import Timer from "./timer";
import EquipIcons from "./equipIcons";

type WeeklyLayoutWorkout = {
  _id: string;
  slug: string;
  name: string;
  type: "weight" | "cardio";
  equipment: string[];
  targetMuscles: string[];
  description: string;
  youtube?: string;
};

type WeeklyLayoutDay = {
  dayOfWeek: number;
  workouts: WeeklyLayoutWorkout[];
};

type WeeklyLayoutResponse = {
  startDay: number;
  days: WeeklyLayoutDay[];
};

type WeightSetLog = {
  reps: string;
  weight: string;
};

type WeeklyWorkoutPlannerProps = {
  initialLayoutDays?: WeeklyLayoutDay[];
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

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekDates(base = new Date()) {
  const result = [];
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i += 1) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    result.push(next);
  }

  return result;
}

export function WeeklyWorkoutPlanner({
  initialLayoutDays = [],
}: WeeklyWorkoutPlannerProps) {
  const [layoutDays, setLayoutDays] =
    useState<WeeklyLayoutDay[]>(initialLayoutDays);
  const [isLoading, setIsLoading] = useState(initialLayoutDays.length === 0);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [drawerWorkout, setDrawerWorkout] =
    useState<WeeklyLayoutWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [activeLogToEdit, setActiveLogToEdit] =
    useState<WeeklyLayoutWorkout | null>(null);
  const [weightSetLogs, setWeightSetLogs] = useState<WeightSetLog[]>([
    { reps: "", weight: "" },
  ]);
  const [logNotes, setLogNotes] = useState("");
  const [logDuration, setLogDuration] = useState("");
  const [logIntensity, setLogIntensity] = useState<number>(25);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [logDate, setLogDate] = useState(() => toIsoDate(new Date()));

  const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState(false);

  const fetchLayout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const todayDay = new Date().getDay();
      const response = await fetch(
        `/api/user-weekly-layout?startDay=${todayDay}`,
      );
      if (!response.ok) {
        throw new Error("Unable to load workout schedule.");
      }

      const data = (await response.json()) as WeeklyLayoutResponse;
      setLayoutDays(Array.isArray(data.days) ? data.days : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializePlanner = useCallback(() => {
    setIsMounted(true);
    setWeekDates(getWeekDates());
    void fetchLayout();
  }, [fetchLayout]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      initializePlanner();
    });

    return () => cancelAnimationFrame(frame);
  }, [initializePlanner]);

  async function patchLayout(days: WeeklyLayoutDay[]) {
    const payload = {
      days: days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        workoutIds: day.workouts.map((workout) => workout._id),
      })),
    };

    const response = await fetch("/api/user-weekly-layout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? "Unable to save weekly layout.");
    }
  }

  function buildUpdatedLayout(
    sourceDayOfWeek: number,
    sourceIndex: number,
    targetDayOfWeek: number,
    targetIndex: number,
  ) {
    const nextDays = layoutDays.map((day) => ({
      ...day,
      workouts: [...day.workouts],
    }));

    const sourceDay = nextDays.find((day) => day.dayOfWeek === sourceDayOfWeek);
    const targetDay = nextDays.find((day) => day.dayOfWeek === targetDayOfWeek);

    if (!sourceDay || !targetDay) {
      return layoutDays;
    }

    const [movedWorkout] = sourceDay.workouts.splice(sourceIndex, 1);
    if (!movedWorkout) {
      return layoutDays;
    }

    let insertAt = Math.min(targetIndex, targetDay.workouts.length);
    if (sourceDayOfWeek === targetDayOfWeek && sourceIndex < insertAt) {
      insertAt -= 1;
    }

    targetDay.workouts.splice(Math.max(insertAt, 0), 0, movedWorkout);

    return nextDays;
  }

  async function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    targetDayOfWeek: number,
    targetIndex = Number.MAX_SAFE_INTEGER,
  ) {
    event.preventDefault();

    const transfer = event.dataTransfer.getData("application/json");
    if (!transfer) {
      return;
    }

    const dragged = JSON.parse(transfer) as {
      sourceDayOfWeek: number;
      sourceIndex: number;
    };

    if (
      !dragged ||
      !Number.isInteger(dragged.sourceDayOfWeek) ||
      !Number.isInteger(dragged.sourceIndex)
    ) {
      return;
    }

    const updatedLayout = buildUpdatedLayout(
      dragged.sourceDayOfWeek,
      dragged.sourceIndex,
      targetDayOfWeek,
      targetIndex,
    );

    setLayoutDays(updatedLayout);

    try {
      await patchLayout(updatedLayout);
      toast.success("Workout schedule updated.");
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast.error(message);
      fetchLayout();
    }
  }

  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
    sourceDayOfWeek: number,
    sourceIndex: number,
  ) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ sourceDayOfWeek, sourceIndex }),
    );
    event.dataTransfer.effectAllowed = "move";
  }

  function openWorkoutDetailsDrawer(workout: WeeklyLayoutWorkout) {
    setDrawerWorkout(workout);
    setIsWishlistDrawerOpen(true);
    setIsLogDrawerOpen(false);
  }

  function openLogDrawer(workout: WeeklyLayoutWorkout, date: string) {
    setActiveLogToEdit(workout);
    setWeightSetLogs([{ reps: "", weight: "" }]);
    setLogNotes("");
    setLogDuration("");
    setLogIntensity(50);
    setLogDate(date);
    setIsSavingLog(false);
    setIsLogDrawerOpen(true);
    setIsWishlistDrawerOpen(false);
  }

  function closeLogDrawer() {
    setIsLogDrawerOpen(false);
    setActiveLogToEdit(null);
  }

  function addWeightSet() {
    setWeightSetLogs((previous) => [...previous, { reps: "", weight: "" }]);
  }

  function removeWeightSet(index: number) {
    setWeightSetLogs((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function updateWeightSet(
    index: number,
    field: keyof WeightSetLog,
    value: string,
  ) {
    setWeightSetLogs((previous) =>
      previous.map((set, currentIndex) =>
        currentIndex === index ? { ...set, [field]: value } : set,
      ),
    );
  }

  async function handleSaveWorkoutLog() {
    if (!activeLogToEdit) {
      closeLogDrawer();
      return;
    }

    const date = `${logDate}T00:00:00.000Z`;
    const notes = logNotes.trim();

    const payload =
      activeLogToEdit.type === "weight"
        ? {
            workoutId: activeLogToEdit._id,
            type: "weight" as const,
            date,
            intensity: logIntensity,
            notes,
            sets: weightSetLogs
              .map((set) => ({
                reps: Number.parseInt(set.reps, 10),
                weight: Number.parseFloat(set.weight),
              }))
              .filter(
                (set) =>
                  Number.isFinite(set.reps) &&
                  set.reps > 0 &&
                  Number.isFinite(set.weight) &&
                  set.weight >= 0,
              ),
          }
        : {
            workoutId: activeLogToEdit._id,
            type: "cardio" as const,
            date,
            intensity: logIntensity,
            notes,
            duration: logDuration.trim(),
          };

    if (payload.type === "weight" && payload.sets.length === 0) {
      toast.error("Add at least one valid set before saving.");
      return;
    }

    if (payload.type === "cardio" && payload.duration.length === 0) {
      toast.error("Duration is required for cardio logs.");
      return;
    }

    setIsSavingLog(true);

    try {
      const response = await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => null);
        throw new Error(
          responsePayload?.error ?? "Unable to save workout log.",
        );
      }

      toast.success("Workout log saved.");
      closeLogDrawer();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSavingLog(false);
    }
  }

  function openAddWorkoutModal() {
    setIsAddWorkoutModalOpen(true);
    setIsWishlistDrawerOpen(false);
    closeLogDrawer();
  }

  function closeAddWorkoutModal() {
    setIsAddWorkoutModalOpen(false);
    fetchLayout();
  }

  const INTENSITY_LABELS: Record<number, string> = {
    0: "Light",
    25: "Moderate",
    50: "Hard",
    75: "Very Hard",
    100: "Max",
  };

  return (
    <div className="">
      {error ? (
        <p className="mt-4 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {isLoading && weekDates.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-base-300/60 bg-base-100/90 p-6 text-sm text-base-content/60">
          Loading schedule...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 ">
          {weekDates.map((date) => {
            const key = toIsoDate(date);
            const dayOfWeek = date.getDay();
            const dayLayout = layoutDays.find(
              (day) => day.dayOfWeek === dayOfWeek,
            );
            const dayWorkouts = dayLayout?.workouts ?? [];

            return (
              <div
                key={key}
                className="p-2"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) =>
                  handleDrop(event, dayOfWeek, dayWorkouts.length)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-base-content">
                      {DAY_NAMES[dayOfWeek]}
                    </p>
                    <p className="text-xs uppercase tracking-[0.24em] text-base-content/45">
                      {formatDate(key)}
                    </p>
                  </div>
                  <span className="badge badge-outline badge-sm rounded-full border-primary/20 bg-primary/5 text-primary">
                    {dayWorkouts.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {dayWorkouts.length === 0 ? (
                    <div className="rounded-3xl border border-base-300/60 bg-base-100/90 px-4 py-6 text-sm text-base-content/60">
                      No workouts yet. Drop one here.
                    </div>
                  ) : (
                    dayWorkouts.map((workout, index) => (
                      <div
                        key={`${dayOfWeek}-${index}-${workout._id}`}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, dayOfWeek, index)
                        }
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, dayOfWeek, index)}
                        className="group cursor-grab rounded-3xl border border-base-300/60 bg-base-100/95 p-4 transition hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex gap-2">
                              <GripVertical />
                              <button
                                type="button"
                                className="text-left w-full flex gap-2 cursor-pointer items-center"
                                onClick={() =>
                                  openWorkoutDetailsDrawer(workout)
                                }
                              >
                                <p className="font-semibold text-base-content cursor-pointer">
                                  {workout.name}
                                </p>
                                <Info className="hidden md:block" />
                              </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-base-content/50">
                              {/* <span>{workout.targetMuscles}</span> */}
                              {workout.targetMuscles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {workout.targetMuscles.map((muscle) => (
                                    <span
                                      key={muscle}
                                      className="badge badge-xs md:badge-md badge-outline border-secondary/20 bg-secondary/5 text-secondary whitespace-normal leading-snug py-2"
                                    >
                                      {muscle}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-base-content/50">
                              <EquipIcons equipment={workout.equipment} />
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => openLogDrawer(workout, key)}
                          >
                            Log Workout
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {dayWorkouts.length <= 5 && (
                  <button
                    type="button"
                    className="border border-dashed border-base-300/40 mt-4 flex items-center justify-center rounded-3xl p-4 text-sm text-base-content/50 transition-colors hover:border-primary/60 cursor-pointer w-full"
                    onClick={openAddWorkoutModal}
                  >
                    <Plus />
                    <span className="ml-2 text-sm text-base-content/50">
                      Add workout
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isMounted ? (
        <ModalPortal>
          <div
            className={[
              "fixed inset-0 z-50 h-screen w-screen",
              isWishlistDrawerOpen || isLogDrawerOpen || isAddWorkoutModalOpen
                ? "pointer-events-auto"
                : "pointer-events-none",
            ].join(" ")}
            aria-hidden={
              !(
                isWishlistDrawerOpen ||
                isLogDrawerOpen ||
                isAddWorkoutModalOpen
              )
            }
          >
            <button
              type="button"
              className={[
                "absolute inset-0 bg-neutral/42 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
                isWishlistDrawerOpen || isLogDrawerOpen || isAddWorkoutModalOpen
                  ? "opacity-100"
                  : "opacity-0",
              ].join(" ")}
              onClick={() => {
                setIsWishlistDrawerOpen(false);
                closeLogDrawer();
                closeAddWorkoutModal();
              }}
              aria-label="Close drawer"
              tabIndex={
                isWishlistDrawerOpen || isLogDrawerOpen || isAddWorkoutModalOpen
                  ? 0
                  : -1
              }
            />

            <div
              className={[
                "absolute inset-y-0 right-0 top-0 h-full w-[min(88vw,26rem)] overflow-y-auto bg-base-100/95 p-3 shadow-2xl transition-transform duration-300 ease-out will-change-transform sm:p-4",
                isWishlistDrawerOpen ? "translate-x-0" : "translate-x-full",
              ].join(" ")}
            >
              <div
                id="mobile-wishlist-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Wishlist"
                className="min-h-full"
              >
                {drawerWorkout ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:items-end sm:justify-between">
                      <div className="flex items-center gap-3 text-secondary">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-secondary">
                            Workout details
                          </p>
                          <h3 className="text-3xl font-semibold text-base-content">
                            {drawerWorkout.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-circle"
                          onClick={() => setIsWishlistDrawerOpen(false)}
                          aria-label="Close wishlist drawer"
                          tabIndex={isWishlistDrawerOpen ? 0 : -1}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <a
                        href={`/workout/${drawerWorkout.slug}`}
                        className="btn btn-outline rounded-full"
                      >
                        Open full view
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                          Equipment
                        </p>
                        <p className="mt-2 text-base-content">
                          {drawerWorkout.equipment.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                      <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                        Target muscles
                      </p>
                      <p className="mt-2 text-base-content">
                        {drawerWorkout.targetMuscles.join(", ")}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                      <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                        Description
                      </p>
                      <p className="mt-2 text-base-content">
                        {drawerWorkout.description}
                      </p>
                    </div>
                    {drawerWorkout.youtube ? (
                      <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                          Video
                        </p>
                        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl">
                          <iframe
                            className="h-full w-full rounded-xl"
                            src={`https://www.youtube.com/embed/${drawerWorkout.youtube.split("v=")[1]}`}
                            title="Workout video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-base-content/70">
                    Workout details could not be loaded.
                  </p>
                )}
              </div>
            </div>

            <div
              className={[
                "absolute inset-y-0 right-0 top-0 h-full w-[min(88vw,26rem)] overflow-y-auto bg-base-100/95 p-3 shadow-2xl transition-transform duration-300 ease-out will-change-transform sm:p-4",
                isLogDrawerOpen ? "translate-x-0" : "translate-x-full",
              ].join(" ")}
            >
              <div className="min-h-full">
                <div className="flex items-center justify-between gap-3 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-secondary">
                      Log workout details
                    </p>
                    <h3 className="text-3xl font-semibold text-base-content">
                      {activeLogToEdit?.name ?? "Log Workout"}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-base-content/50">
                      {formatDate(logDate)}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={closeLogDrawer}
                    aria-label="Close log drawer"
                    tabIndex={isLogDrawerOpen ? 0 : -1}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Timer />
                <div className="grid gap-4 justify-center">
                  {activeLogToEdit?.type === "weight" ? (
                    <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm uppercase tracking-[0.24em] text-base-content/50">
                          Sets (reps and weight)
                        </p>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={addWeightSet}
                          disabled={weightSetLogs.length >= 5}
                        >
                          <Plus className="h-4 w-4" />
                          Add set
                        </button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {weightSetLogs.map((set, index) => (
                          <div
                            key={`set-${index + 1}`}
                            className="grid grid-cols-12 items-end gap-2"
                          >
                            <div className="col-span-12 sm:col-span-2 text-sm text-base-content/60">
                              Set {index + 1}
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                              <label
                                htmlFor={`reps-${index}`}
                                className="label py-1"
                              >
                                <span className="label-text text-xs uppercase tracking-[0.2em] text-base-content/45">
                                  Reps
                                </span>
                              </label>
                              <input
                                id={`reps-${index}`}
                                type="number"
                                min={1}
                                value={set.reps}
                                onChange={(event) =>
                                  updateWeightSet(
                                    index,
                                    "reps",
                                    event.target.value,
                                  )
                                }
                                className="input input-bordered w-full bg-base-100"
                                placeholder="e.g. 10"
                              />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                              <label
                                htmlFor={`weight-${index}`}
                                className="label py-1"
                              >
                                <span className="label-text text-xs uppercase tracking-[0.2em] text-base-content/45">
                                  Weight
                                </span>
                              </label>
                              <input
                                id={`weight-${index}`}
                                type="number"
                                min={0}
                                step="0.5"
                                value={set.weight}
                                onChange={(event) =>
                                  updateWeightSet(
                                    index,
                                    "weight",
                                    event.target.value,
                                  )
                                }
                                className="input input-bordered w-full bg-base-100"
                                placeholder="e.g. 135"
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-2">
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm w-full cursor-pointer"
                                onClick={() => removeWeightSet(index)}
                                disabled={weightSetLogs.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid justify-center w-full gap-4">
                      <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5 mt-4">
                        <label htmlFor="duration" className="label">
                          <span className="label-text text-sm uppercase tracking-[0.24em] text-base-content/50">
                            Duration
                          </span>
                        </label>
                        <input
                          id="duration"
                          type="text"
                          value={logDuration}
                          onChange={(event) =>
                            setLogDuration(event.target.value)
                          }
                          className="input input-bordered w-full bg-base-100"
                          placeholder="e.g. 45 min"
                        />
                      </div>
                    </div>
                  )}
                  <div className="w-full rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
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
                      value={logIntensity}
                      onChange={(e) => setLogIntensity(Number(e.target.value))}
                      className="range"
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
                      {INTENSITY_LABELS[logIntensity]}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5">
                    <label htmlFor="notes" className="label">
                      <span className="label-text text-sm uppercase tracking-[0.24em] text-base-content/50">
                        Notes
                      </span>
                    </label>
                    <textarea
                      id="notes"
                      value={logNotes}
                      onChange={(event) => setLogNotes(event.target.value)}
                      rows={5}
                      className="textarea textarea-bordered w-full bg-base-100"
                      placeholder="Add workout notes"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="btn btn-ghost w-full sm:w-auto"
                      onClick={closeLogDrawer}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary w-full sm:w-auto"
                      onClick={handleSaveWorkoutLog}
                      disabled={isSavingLog}
                    >
                      {isSavingLog ? "Saving..." : "Save log"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isAddWorkoutModalOpen ? (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-3xl">
                  <div className="relative">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-circle absolute right-6 top-6 z-10"
                      onClick={closeAddWorkoutModal}
                      aria-label="Close add workout modal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <UserWorkoutManager />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </ModalPortal>
      ) : null}
    </div>
  );
}
