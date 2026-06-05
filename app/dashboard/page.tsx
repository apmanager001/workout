import type { Metadata } from "next";
import { WeeklyWorkoutPlanner } from "../../components/workout/weekly-workout-planner";
import { requireServerSession } from "@/lib/backend/auth/session";
import { getUserWeeklyLayoutFromStartDay } from "@/lib/backend/weekly-layout";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "Your weekly workout dashboard for planning training days, adding workouts, and tracking progress.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const session = await requireServerSession();
  const authUserId = session.user.id ?? session.user.email ?? "";
  const today = new Date().getDay();

  const initialLayout = authUserId
    ? await getUserWeeklyLayoutFromStartDay(authUserId, today)
    : { startDay: today, days: [] };

  return (
    <section className="section-shell py-8 lg:py-14">
      <div className="glass-panel rounded-3xl border border-base-300/70 lg:shadow-xl shadow-primary/50 px-4">
        {/* <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-base-content sm:text-5xl">
              Welcome back, {userLabel}.
            </h1>
          </div>
        </div> */}

        <div className="mt-8">
          <WeeklyWorkoutPlanner initialLayoutDays={initialLayout.days} />
        </div>
        {/* <div className="mt-8">
          <UserWorkoutManager />
        </div> */}
      </div>
    </section>
  );
}
