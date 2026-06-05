import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/lib/backend/auth/session";
import {
  appendWorkoutToUserWeeklyDay,
  getUserWeeklyLayoutFromStartDay,
  updateUserWeeklyLayout,
} from "@/lib/backend/weekly-layout";

function getAuthUserId(
  session: Awaited<ReturnType<typeof requireServerSession>>,
) {
  return session.user.id ?? session.user.email ?? "";
}

const patchWeeklyLayoutSchema = z.object({
  days: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        workoutIds: z.array(z.string().min(1)),
      }),
    )
    .min(1),
});

const addWorkoutSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  workoutId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const session = await requireServerSession();
  const authUserId = getAuthUserId(session);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startDayParam = request.nextUrl.searchParams.get("startDay");
  const parsedStartDay = Number(startDayParam);
  const startDay = Number.isFinite(parsedStartDay)
    ? Math.max(0, Math.min(6, parsedStartDay))
    : new Date().getDay();

  const layout = await getUserWeeklyLayoutFromStartDay(authUserId, startDay);
  return NextResponse.json(layout);
}

export async function PATCH(request: NextRequest) {
  const session = await requireServerSession();
  const authUserId = getAuthUserId(session);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parseResult = patchWeeklyLayoutSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  try {
    await updateUserWeeklyLayout(authUserId, parseResult.data.days);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update weekly layout.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const session = await requireServerSession();
  const authUserId = getAuthUserId(session);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parseResult = addWorkoutSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  try {
    await appendWorkoutToUserWeeklyDay(
      authUserId,
      parseResult.data.dayOfWeek,
      parseResult.data.workoutId,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to add workout.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
