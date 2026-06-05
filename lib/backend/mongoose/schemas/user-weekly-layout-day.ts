import { InferSchemaType, Schema, model, models } from "mongoose";

const userWeeklyLayoutDaySchema = new Schema(
  {
    authUserId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    workouts: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Workout",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

userWeeklyLayoutDaySchema.index(
  { authUserId: 1, dayOfWeek: 1 },
  { unique: true },
);

export type UserWeeklyLayoutDayDocument = InferSchemaType<
  typeof userWeeklyLayoutDaySchema
>;

export const UserWeeklyLayoutDayModel =
  models.UserWeeklyLayoutDay ||
  model("UserWeeklyLayoutDay", userWeeklyLayoutDaySchema);
