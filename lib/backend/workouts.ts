import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { WorkoutModel } from "@/lib/backend/mongoose/schemas/workout";
import { workouts as sampleWorkouts } from "@/lib/workouts/data";

export async function getAllWorkouts() {
  await connectMongoose();
  const dbWorkouts = await WorkoutModel.find().sort({ createdAt: 1 }).lean();
  return dbWorkouts.length > 0 ? dbWorkouts : sampleWorkouts;
}

export async function getWorkoutBySlug(slug: string) {
  await connectMongoose();
  const dbWorkout = await WorkoutModel.findOne({ slug }).lean();
  if (dbWorkout) {
    return dbWorkout;
  }

  return sampleWorkouts.find((workout) => workout.slug === slug) ?? null;
}

export async function createWorkout(data: {
  name: string;
  type: "weight" | "cardio";
  equipment: string[];
  targetMuscles: string[];
  description: string;
  youtube?: string;
}) {
  await connectMongoose();
  const slug = data.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await WorkoutModel.findOne({ slug }).lean();
  if (existing) {
    throw new Error("A workout with that name already exists.");
  }

  const workout = await WorkoutModel.create({
    slug,
    name: data.name,
    type: data.type,
    equipment: data.equipment,
    targetMuscles: data.targetMuscles,
    description: data.description,
    youtube: data.youtube ?? "",
  });

  return workout;
}
