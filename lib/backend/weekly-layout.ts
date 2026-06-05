import { Types } from "mongoose";
import { connectMongoose } from "@/lib/backend/mongoose/connection";
import { UserWeeklyLayoutDayModel } from "@/lib/backend/mongoose/schemas/user-weekly-layout-day";
import { WorkoutModel } from "@/lib/backend/mongoose/schemas/workout";

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export type WeeklyLayoutWorkout = {
  _id: string;
  slug: string;
  name: string;
  type: "weight" | "cardio";
  equipment: string[];
  targetMuscles: string[];
  description: string;
  youtube?: string;
};

export type WeeklyLayoutDay = {
  dayOfWeek: number;
  workouts: WeeklyLayoutWorkout[];
};

export type WeeklyLayoutUpdateInput = {
  dayOfWeek: number;
  workoutIds: string[];
};

function normalizeDayOfWeek(day: number) {
  return ((day % 7) + 7) % 7;
}

function getDayOrderFromStart(startDay: number) {
  const normalizedStart = normalizeDayOfWeek(startDay);
  return WEEK_DAYS.map((offset) => (normalizedStart + offset) % 7);
}

async function ensureUserDays(authUserId: string) {
  await connectMongoose();

  const ops = WEEK_DAYS.map((dayOfWeek) => ({
    updateOne: {
      filter: { authUserId, dayOfWeek },
      update: {
        $setOnInsert: {
          authUserId,
          dayOfWeek,
          workouts: [],
        },
      },
      upsert: true,
    },
  }));

  await UserWeeklyLayoutDayModel.bulkWrite(ops, { ordered: false });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapWorkout(workout: unknown): WeeklyLayoutWorkout | null {
  if (!isObject(workout)) {
    return null;
  }

  const {
    _id,
    slug,
    name,
    type,
    equipment,
    targetMuscles,
    description,
    youtube,
  } = workout;

  if (!_id || !slug || !name) {
    return null;
  }

  return {
    _id: String(_id),
    slug: String(slug),
    name: String(name),
    type: type === "cardio" ? "cardio" : "weight",
    equipment: Array.isArray(equipment)
      ? equipment.map((item) => String(item))
      : [],
    targetMuscles: Array.isArray(targetMuscles)
      ? targetMuscles.map((item) => String(item))
      : [],
    description: String(description ?? ""),
    youtube: youtube ? String(youtube) : undefined,
  };
}

export async function getUserWeeklyLayoutFromStartDay(
  authUserId: string,
  startDay: number,
) {
  await ensureUserDays(authUserId);

  const dayDocs = (await UserWeeklyLayoutDayModel.find({ authUserId })
    .sort({ dayOfWeek: 1 })
    .populate({
      path: "workouts",
      select: "slug name type equipment targetMuscles description youtube",
    })
    .lean()) as Array<{
    authUserId: string;
    dayOfWeek: number;
    workouts: unknown[] | unknown;
  }>;

  const byDay = new Map<number, WeeklyLayoutDay>();

  for (const dayDoc of dayDocs) {
    const workouts = Array.isArray(dayDoc.workouts)
      ? dayDoc.workouts
          .map(mapWorkout)
          .filter(
            (
              workout: WeeklyLayoutWorkout | null,
            ): workout is WeeklyLayoutWorkout => Boolean(workout),
          )
      : [];

    byDay.set(dayDoc.dayOfWeek, {
      dayOfWeek: dayDoc.dayOfWeek,
      workouts,
    });
  }

  const orderedDayNumbers = getDayOrderFromStart(startDay);
  const days = orderedDayNumbers.map((dayOfWeek) => {
    return (
      byDay.get(dayOfWeek) ?? {
        dayOfWeek,
        workouts: [],
      }
    );
  });

  return {
    startDay: normalizeDayOfWeek(startDay),
    days,
  };
}

export async function updateUserWeeklyLayout(
  authUserId: string,
  updates: WeeklyLayoutUpdateInput[],
) {
  await ensureUserDays(authUserId);

  const seenDays = new Set<number>();
  for (const update of updates) {
    const normalizedDay = normalizeDayOfWeek(update.dayOfWeek);
    if (seenDays.has(normalizedDay)) {
      throw new Error("Duplicate day updates are not allowed.");
    }
    seenDays.add(normalizedDay);
  }

  const ops = updates.map((update) => {
    const dayOfWeek = normalizeDayOfWeek(update.dayOfWeek);
    const workouts = update.workoutIds.map((id) => new Types.ObjectId(id));

    return {
      updateOne: {
        filter: { authUserId, dayOfWeek },
        update: { $set: { workouts } },
        upsert: true,
      },
    };
  });

  if (ops.length > 0) {
    await UserWeeklyLayoutDayModel.bulkWrite(ops, { ordered: false });
  }
}

export async function appendWorkoutToUserWeeklyDay(
  authUserId: string,
  dayOfWeek: number,
  workoutId: string,
) {
  await ensureUserDays(authUserId);

  const exists = await WorkoutModel.exists({ _id: workoutId });
  if (!exists) {
    throw new Error("Workout not found.");
  }

  const normalizedDay = normalizeDayOfWeek(dayOfWeek);
  await UserWeeklyLayoutDayModel.findOneAndUpdate(
    { authUserId, dayOfWeek: normalizedDay },
    { $push: { workouts: new Types.ObjectId(workoutId) } },
    { new: true, upsert: true },
  );
}
