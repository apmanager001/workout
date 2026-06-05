export type WorkoutType = "weight" | "cardio";

export type Workout = {
  slug: string;
  name: string;
  type: WorkoutType;
  equipment: string[];
  targetMuscles: string[];
  description: string;
  youtube?: string;
};

export const workouts: Workout[] = [
  {
    slug: "barbell-flat-bench-press",
    name: "Barbell Flat Bench Press",
    type: "weight",
    equipment: ["Bar", "Rack"],
    targetMuscles: ["Chest", "Front Shoulders", "Triceps"],
    description:
      "Primary chest strength builder. Keep your feet flat and press your upper back into the bench.",
  },
  {
    slug: "dumbbell-suitcase-squat",
    name: "Dumbbell Suitcase Squat",
    type: "weight",
    equipment: ["Dumbbells"],
    targetMuscles: ["Quads", "Glutes", "Grip Strength"],
    description:
      "Hold dumbbells at your sides like suitcases. Lowers your center of gravity for great balance and less back strain.",
  },
  {
    slug: "dumbbell-single-arm-row",
    name: "Dumbbell Single-Arm Row",
    type: "weight",
    equipment: ["Dumbbell", "Bench"],
    targetMuscles: ["Upper Back", "Lats", "Biceps"],
    description:
      "Keep your torso flat and parallel to the bench. Pull the dumbbell back toward your hip.",
  },
  {
    slug: "dumbbell-glute-thrust",
    name: "Dumbbell Glute Thrust",
    type: "weight",
    equipment: ["Dumbbell", "Bench"],
    targetMuscles: ["Glutes", "Hamstrings"],
    description:
      "Sit on the floor with upper back against the bench, place weight on hips, and drive hips up to the ceiling.",
  },
  {
    slug: "heavy-bag-hiit-intervals",
    name: "Heavy Bag HIIT Intervals",
    type: "cardio",
    equipment: ["Punching Bag"],
    targetMuscles: ["Cardio", "Core", "Shoulder Stamina"],
    description:
      "Throw hard, fast punches non-stop for 30 seconds to spike your heart rate and torch calories.",
  },
  {
    slug: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    type: "weight",
    equipment: ["Dumbbells", "Incline Bench"],
    targetMuscles: ["Upper Chest", "Front Shoulders"],
    description:
      "Set the bench to a 30-45 degree angle. Focus on a deep stretch at the bottom of the movement.",
  },
  {
    slug: "dumbbell-reverse-lunges",
    name: "Dumbbell Reverse Lunges",
    type: "weight",
    equipment: ["Dumbbells"],
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    description:
      "Step backward into the lunge. This dynamic movement is highly effective and much safer on the knees.",
  },
  {
    slug: "dumbbell-seated-shoulder-press",
    name: "Dumbbell Seated Shoulder Press",
    type: "weight",
    equipment: ["Dumbbells", "Bench"],
    targetMuscles: ["Shoulders", "Triceps"],
    description:
      "Sit fully upright with back supported. Press the dumbbells straight overhead without arching your lower back.",
  },
  {
    slug: "heavy-bag-endurance-round",
    name: "Heavy Bag Endurance Round",
    type: "cardio",
    equipment: ["Punching Bag"],
    targetMuscles: ["Stamina", "Footwork", "Cardio"],
    description:
      "Keep a steady, rhythmic pace for the full 3 minutes. Focus on continuous movement and light, snappy jabs.",
  },
  {
    slug: "dumbbell-bicep-curls",
    name: "Dumbbell Bicep Curls",
    type: "weight",
    equipment: ["Dumbbells"],
    targetMuscles: ["Biceps", "Forearms"],
    description:
      "Keep your elbows tucked tightly to your sides. Focus on squeezing the muscle at the top without swinging.",
  },
];

export function getWorkoutBySlug(slug: string) {
  return workouts.find((workout) => workout.slug === slug);
}
