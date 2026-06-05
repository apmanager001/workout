import { NextResponse, NextRequest } from "next/server";
import { getWorkoutBySlug } from "@/lib/backend/workouts";

type WorkoutRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: NextRequest, context: WorkoutRouteContext) {
  const { slug } = await context.params;
  const workout = await getWorkoutBySlug(slug);

  if (!workout) {
    return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  }

  return NextResponse.json(workout);
}
