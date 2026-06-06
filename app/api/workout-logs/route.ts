import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { requireServerSession } from "@/lib/backend/auth/session";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { WorkoutLogModel } from "@/lib/backend/mongoose/schemas/workout-log";
import { WorkoutModel } from "@/lib/backend/mongoose/schemas/workout";

function getAuthUserId(
  session: Awaited<ReturnType<typeof requireServerSession>>,
) {
  return session.user.id ?? session.user.email ?? "";
}

const logDateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

const workoutLogSchema = z.discriminatedUnion("type", [
  z.object({
    workoutId: z.string().min(1),
    date: logDateSchema,
    type: z.literal("weight"),
    intensity: z.number().int().min(0).max(100),
    notes: z.string().optional(),
    sets: z
      .array(
        z.object({
          reps: z.number().int().min(1),
          weight: z.number().min(0),
        }),
      )
      .min(1),
  }),
  z.object({
    workoutId: z.string().min(1),
    date: logDateSchema,
    type: z.literal("cardio"),
    intensity: z.number().int().min(0).max(100),
    notes: z.string().optional(),
    duration: z.string().trim().min(1),
  }),
]);

const workoutLogHistoryQuerySchema = z.object({
  type: z.enum(["weight", "cardio"]).optional(),
  workoutId: z.string().optional(),
  startDate: logDateSchema.optional(),
  endDate: logDateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

function parseLogDate(input: string, endOfDay = false) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? new Date(`${input}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
    : new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid log date.");
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const session = await requireServerSession();
  const authUserId = getAuthUserId(session);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const queryParams = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );
  const parseResult = workoutLogHistoryQuerySchema.safeParse(queryParams);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  const { type, workoutId, startDate, endDate, limit } = parseResult.data;

  if (workoutId && !Types.ObjectId.isValid(workoutId)) {
    return NextResponse.json({ error: "Invalid workout id." }, { status: 400 });
  }

  const filter: {
    authUserId: string;
    type?: "weight" | "cardio";
    workoutId?: Types.ObjectId;
    date?: {
      $gte?: Date;
      $lte?: Date;
    };
  } = {
    authUserId,
  };

  if (type) {
    filter.type = type;
  }

  if (workoutId) {
    filter.workoutId = new Types.ObjectId(workoutId);
  }

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte = parseLogDate(startDate);
    }

    if (endDate) {
      filter.date.$lte = parseLogDate(endDate, true);
    }
  }

  await connectMongoose();

  const logs = await WorkoutLogModel.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate({
      path: "workoutId",
      select: "_id slug name type equipment targetMuscles",
    })
    .lean();

  return NextResponse.json(logs);
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

  const parseResult = workoutLogSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  const payload = parseResult.data;

  if (!Types.ObjectId.isValid(payload.workoutId)) {
    return NextResponse.json({ error: "Invalid workout id." }, { status: 400 });
  }

  const logDate = parseLogDate(payload.date);

  await connectMongoose();

  const workout = await WorkoutModel.findById(payload.workoutId)
    .select("_id type")
    .lean();

  if (!workout) {
    return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  }

  if (workout.type !== payload.type) {
    return NextResponse.json(
      { error: "Workout type does not match log type." },
      { status: 400 },
    );
  }

  const saved =
    payload.type === "weight"
      ? await WorkoutLogModel.create({
          authUserId,
          workoutId: workout._id,
          type: payload.type,
          date: logDate,
          intensity: payload.intensity,
          notes: payload.notes?.trim() ?? "",
          sets: payload.sets,
        })
      : await WorkoutLogModel.create({
          authUserId,
          workoutId: workout._id,
          type: payload.type,
          date: logDate,
          intensity: payload.intensity,
          notes: payload.notes?.trim() ?? "",
          duration: payload.duration.trim(),
        });

  return NextResponse.json(saved, { status: 201 });
}
