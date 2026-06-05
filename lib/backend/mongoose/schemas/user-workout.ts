import { InferSchemaType, Schema, model, models } from "mongoose";

const userWorkoutSchema = new Schema(
  {
    authUserId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    workoutSlug: {
      type: String,
      required: true,
      trim: true,
    },
    workoutName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["weight", "cardio"],
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export type UserWorkoutLog = InferSchemaType<typeof userWorkoutSchema>;

export const UserWorkoutLogModel =
  models.UserWorkoutLog || model("UserWorkoutLog", userWorkoutSchema);
