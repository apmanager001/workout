import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { UserWorkoutLogModel } from "@/lib/backend/mongoose/schemas/user-workout";
import { requireServerSession } from "@/lib/backend/auth/session";
import { getWorkoutBySlug } from "@/lib/workouts/data";

const createWorkoutSchema = z.object({
  workoutSlug: z.string().min(1),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().optional(),
});

function getAuthUserId(
  session: Awaited<ReturnType<typeof requireServerSession>>,
) {
  return session.user.id ?? session.user.email ?? "";
}

async function getSessionUserId() {
  const session = await requireServerSession();
  const authUserId = getAuthUserId(session);
  if (!authUserId) {
    return NextResponse.json(
      { error: "Unable to resolve user identity." },
      { status: 401 },
    );
  }
  return authUserId;
}

export async function GET() {
  const session = await requireServerSession();
  const authUserId = getAuthUserId(session);

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongoose();
  const workouts = await UserWorkoutLogModel.find({ authUserId })
    .sort({ date: 1, createdAt: 1 })
    .lean();

  return NextResponse.json(workouts);
}

const patchOrderSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
});

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

  const parseResult = createWorkoutSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  const { workoutSlug, date, notes } = parseResult.data;
  const workout = getWorkoutBySlug(workoutSlug);

  if (!workout) {
    return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  }

  await connectMongoose();

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const order = await UserWorkoutLogModel.countDocuments({
    authUserId,
    date: { $gte: dayStart, $lt: dayEnd },
  });

  const saved = await UserWorkoutLogModel.create({
    authUserId,
    workoutSlug,
    workoutName: workout.name,
    type: workout.type,
    date: dayStart,
    notes: notes ?? "",
    order,
  });

  return NextResponse.json(saved, { status: 201 });
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

  const parseResult = patchOrderSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 },
    );
  }

  await connectMongoose();

  const updates = parseResult.data.updates;
  const bulkOps = updates.map((update) => ({
    updateOne: {
      filter: { _id: update.id, authUserId },
      update: {
        date: new Date(`${update.date}T00:00:00.000Z`),
        order: update.order,
      },
    },
  }));

  await UserWorkoutLogModel.bulkWrite(bulkOps);

  return NextResponse.json({ success: true });
}
