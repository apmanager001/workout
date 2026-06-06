import { InferSchemaType, Schema, model, models } from "mongoose";

const weightSetSchema = new Schema(
  {
    reps: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const workoutLogSchema = new Schema(
  {
    authUserId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
      index: true,
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
      index: true,
    },
    intensity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    sets: {
      type: [weightSetSchema],
      default: undefined,
    },
    duration: {
      type: String,
      default: undefined,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

workoutLogSchema.index({ authUserId: 1, date: -1 });

workoutLogSchema.pre("validate", function validateTypeSpecificFields() {
  if (this.type === "weight") {
    this.duration = undefined;

    if (!Array.isArray(this.sets) || this.sets.length === 0) {
      this.invalidate("sets", "Weight logs require at least one set.");
    }
  }

  if (this.type === "cardio") {
    this.sets = undefined;

    if (!this.duration || this.duration.trim().length === 0) {
      this.invalidate("duration", "Cardio logs require a duration.");
    }
  }
});

export type WorkoutLogDocument = InferSchemaType<typeof workoutLogSchema>;

if (process.env.NODE_ENV !== "production" && models.WorkoutLog) {
  delete models.WorkoutLog;
}

export const WorkoutLogModel =
  models.WorkoutLog || model("WorkoutLog", workoutLogSchema);
