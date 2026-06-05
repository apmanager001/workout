import { NextResponse, NextRequest } from "next/server";
import { getWorkoutBySlug } from "@/lib/backend/workouts";

export async function GET(_request: NextRequest, context: any) {
  const params = await context.params;
  const workout = await getWorkoutBySlug(params.slug);

  if (!workout) {
    return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  }

  return NextResponse.json(workout);
}
