import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllWorkouts, createWorkout } from "@/lib/backend/workouts";
import { requireAdminSession } from "@/lib/backend/auth/session";

const createWorkoutSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["weight", "cardio"]),
  equipment: z.string().optional(),
  targetMuscles: z.string().optional(),
  description: z.string().trim().min(1),
  youtube: z.string().url().optional(),
});

export async function GET() {
  const workouts = await getAllWorkouts();
  return NextResponse.json(workouts);
}

export async function POST(request: NextRequest) {
  await requireAdminSession();

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parseResult = createWorkoutSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  const { name, type, equipment, targetMuscles, description, youtube } =
    parseResult.data;

  const workout = await createWorkout({
    name,
    type,
    equipment: equipment
      ? equipment
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    targetMuscles: targetMuscles
      ? targetMuscles
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    description,
    youtube,
  });

  return NextResponse.json(workout, { status: 201 });
}
