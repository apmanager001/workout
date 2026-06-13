import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  Flame,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { WorkoutCard } from "@/components/workout/workout-card";
import { siteConfig } from "@/lib/config/site";
import { workouts } from "@/lib/workouts/data";
import { absoluteUrl, createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Workout Forge",
  description:
    "Workout Forge is a dark-mode training planner with exercise details, weekly logging, and admin-managed workouts.",
  path: "/",
  keywords: [
    ...siteConfig.keywords,
    "workout planner",
    "training log",
    "exercise library",
  ],
});

const featureCards = [
  {
    title: "7-day workout planner",
    description:
      "Schedule training sessions from Sunday through Saturday with a clear day-by-day exercise view.",
    icon: ShieldCheck,
  },
  {
    title: "Workout library",
    description:
      "Browse strength and cardio routines with equipment, target muscles, and coaching notes.",
    icon: Dumbbell,
  },
  {
    title: "Smart logging",
    description:
      "Prepare to adapt the form experience to weight and cardio workouts as users log sets and sessions.",
    icon: Flame,
  },
] as const;

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/#webpage"),
    url: absoluteUrl("/"),
    name: `${siteConfig.name} homepage`,
    description: siteConfig.description,
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
  },
];

export default function Home() {
  return (
    <div className="pb-24 pt-6 px-2 sm:px-0 sm:pt-8 lg:pt-12">
      <JsonLd data={homeJsonLd} />
      <section className="section-shell grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-8">
          <div className="badge badge-outline badge-lg gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <Sparkles className="h-4 w-4" />
            Workout planner
          </div>

          <div className="space-y-5">
            <h1 className="text-balance font-display text-5xl font-semibold tracking-tight text-base-content sm:text-6xl lg:text-7xl">
              Track your weekly training.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-base-content/72 sm:text-xl">
              Workout Forge brings workout scheduling, a public exercise
              catalog, and protected user views together with auth, MongoDB, and
              polished dark mode styling.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="btn btn-primary btn-lg rounded-full px-7 shadow-lg shadow-primary/20"
            >
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/workouts"
              className="btn btn-ghost btn-lg rounded-full border border-base-300/70 bg-base-100/75 px-7"
            >
              View workouts
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="glass-panel rounded-xl border border-base-300/70 p-4 shadow-lg shadow-primary/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                  {feature.title}
                </p>
                <p className="mt-2 leading-7 text-base-content/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-6">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl" />

          <div className="relative mx-auto w-full max-w-md rounded-4xl border border-base-300/60 bg-base-100/70 p-4 shadow-2xl shadow-primary/10 ring-1 ring-base-300/40">
            <Image
              src="/splash.png"
              alt="Workout Forge mobile splash"
              width={640}
              height={480}
              className="w-full rounded-3xl object-contain"
            />
          </div>

          {/* <div className="glass-panel relative overflow-hidden rounded-2xl border border-base-300/70 p-6 shadow-[0_30px_120px_-44px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/45">
                  Workout library
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-base-content">
                  Build every training day from a curated exercise catalog.
                </h2>
              </div>
              <span className="badge badge-accent badge-outline rounded-full inline-flex items-center px-4 py-2 font-medium leading-none whitespace-nowrap">
                Mobile friendly
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-base-100/85 p-5 shadow-md shadow-primary/5 ring-1 ring-base-300/70">
                <p className="text-sm font-semibold text-base-content">
                  Public exercises
                </p>
                <p className="mt-2 text-sm leading-6 text-base-content/68">
                  Each workout has equipment, target muscles, and guidance for
                  cardio or weight sessions.
                </p>
              </div>
              <div className="rounded-xl bg-base-100/85 p-5 shadow-md shadow-primary/5 ring-1 ring-base-300/70">
                <p className="text-sm font-semibold text-base-content">
                  Protected pages
                </p>
                <p className="mt-2 text-sm leading-6 text-base-content/68">
                  Authenticated dashboard and settings are ready for your user
                  sessions and workout logging flows.
                </p>
              </div>
            </div>
          </div>*/}
        </div>
      </section>

      <section className="section-shell py-10 lg:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Featured workouts
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
              Ten workouts to start your weekly training plan.
            </h2>
          </div>
          <Link href="/workouts" className="btn btn-outline rounded-full px-6">
            Browse all
          </Link>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {workouts.slice(0, 10).map((workout) => (
            <WorkoutCard key={workout.slug} workout={workout} />
          ))}
        </div>
      </section>
    </div>
  );
}
