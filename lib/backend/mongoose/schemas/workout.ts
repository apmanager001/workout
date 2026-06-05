import { InferSchemaType, Schema, model, models } from "mongoose";

const workoutSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
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
    equipment: {
      type: [String],
      default: [],
    },
    targetMuscles: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    youtube: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type WorkoutDocument = InferSchemaType<typeof workoutSchema>;

export const WorkoutModel = models.Workout || model("Workout", workoutSchema);
