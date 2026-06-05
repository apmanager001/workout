"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";

type AdminWorkoutForm = {
  name: string;
  type: "weight" | "cardio";
  equipment: string;
  targetMuscles: string;
  description: string;
  youtube: string;
};

type WorkoutItem = {
  _id: string;
  slug: string;
  name: string;
  type: "weight" | "cardio";
  equipment: string[];
  targetMuscles: string[];
  description: string;
  youtube?: string;
};

export function AdminWorkoutManager() {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<AdminWorkoutForm>({
    name: "",
    type: "weight",
    equipment: "",
    targetMuscles: "",
    description: "",
    youtube: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchWorkouts() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/workouts");
      if (!response.ok) {
        throw new Error("Unable to load workouts.");
      }
      setWorkouts(await response.json());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkouts();
  }, []);

  function updateField(field: keyof AdminWorkoutForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to add workout.");
      }

      setSuccess("Workout added successfully.");
      setForm({
        name: "",
        type: "weight",
        equipment: "",
        targetMuscles: "",
        description: "",
        youtube: "",
      });
      await fetchWorkouts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-10 rounded-3xl border border-base-300/70 bg-base-100/80 p-6 shadow-xl shadow-primary/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-base-content/45">
            Workout types manager
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-base-content">
            Workout type library
          </h2>
        </div>
        <button
          type="button"
          className="btn btn-primary rounded-full px-6"
          onClick={() => {
            setIsOpen(true);
            setError(null);
            setSuccess(null);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add workout
        </button>
      </div>

      {isLoading ? (
        <div className="mt-6 flex items-center gap-2 text-base-content/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading workouts...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workouts.map((workout) => (
            <article
              key={workout._id}
              className="rounded-3xl border border-base-300/70 bg-base-100/90 p-5"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-base-content/45">
                {workout.type}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-base-content">
                {workout.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-base-content/70">
                {workout.description}
              </p>
              <div className="mt-4 text-xs uppercase tracking-[0.22em] text-base-content/55">
                Equipment: {workout.equipment.join(", ") || "None"}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.22em] text-base-content/55">
                Targets: {workout.targetMuscles.join(", ") || "None"}
              </div>
            </article>
          ))}
        </div>
      )}

      {isOpen ? (
        <div className="modal modal-open">
          <div className="modal-box relative max-w-3xl">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-xl font-semibold text-base-content">
              Add workout type
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label-text">Workout Name</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className="input w-full rounded-3xl border border-base-300/70 bg-base-100/90"
                  />
                </label>
                <label className="block">
                  <span className="label-text">Type</span>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateField("type", event.target.value)
                    }
                    className="select w-full rounded-3xl border border-base-300/70 bg-base-100/90"
                  >
                    <option value="weight">weight</option>
                    <option value="cardio">cardio</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label-text">Equipment</span>
                  <input
                    value={form.equipment}
                    onChange={(event) =>
                      updateField("equipment", event.target.value)
                    }
                    placeholder="Comma-separated"
                    className="input w-full rounded-3xl border border-base-300/70 bg-base-100/90"
                  />
                </label>
                <label className="block">
                  <span className="label-text">Target Muscles</span>
                  <input
                    value={form.targetMuscles}
                    onChange={(event) =>
                      updateField("targetMuscles", event.target.value)
                    }
                    placeholder="Comma-separated"
                    className="input w-full rounded-3xl border border-base-300/70 bg-base-100/90"
                  />
                </label>
              </div>

              <label className="block">
                <span className="label-text">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="textarea h-28 w-full rounded-3xl border border-base-300/70 bg-base-100/90"
                />
              </label>

              <label className="block">
                <span className="label-text">YouTube URL</span>
                <input
                  value={form.youtube}
                  onChange={(event) =>
                    updateField("youtube", event.target.value)
                  }
                  placeholder="https://youtube.com/..."
                  className="input w-full rounded-3xl border border-base-300/70 bg-base-100/90"
                />
              </label>

              {error ? (
                <p className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                  {success}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="btn btn-ghost rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-full px-6"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Save workout
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
