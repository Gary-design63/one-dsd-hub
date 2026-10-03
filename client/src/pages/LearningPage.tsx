import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Flag,
  GraduationCap,
  Target,
} from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const CHECKLIST_STORAGE_KEY = "onedsd-checklist-v3";
const CHECKLIST_TOTAL = 10;

const featuredCourses = [
  {
    title: "Disability Justice Foundations",
    detail: "Foundational · 90 min",
    progress: 100,
    status: "Completed",
  },
  {
    title: "Language Justice & Accessible Communication",
    detail: "Foundational · 75 min",
    progress: 64,
    status: "In progress",
  },
  {
    title: "Employment First in Practice",
    detail: "Intermediate · 180 min",
    progress: 0,
    status: "Not started",
  },
];

const journey = [
  { label: "Foundation", description: "Build a shared equity and disability justice vocabulary." },
  { label: "Application", description: "Put learning into practice through tools and guided work." },
  { label: "Leadership", description: "Model accountable, community-led systems change." },
];

export default function LearningPage() {
  const [completedChecklistItems, setCompletedChecklistItems] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) ?? "{}") as Record<string, boolean>;
        setCompletedChecklistItems(Object.values(saved).filter(Boolean).length);
      } catch {
        setCompletedChecklistItems(0);
      }
    };

    updateProgress();
    window.addEventListener("storage", updateProgress);
    return () => window.removeEventListener("storage", updateProgress);
  }, []);

  const overallProgress = useMemo(
    () => Math.round((completedChecklistItems / CHECKLIST_TOTAL) * 100),
    [completedChecklistItems],
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-[hsl(var(--mn-green)/0.35)] bg-[hsl(var(--mn-green)/0.08)] text-[hsl(var(--mn-green-dark))]">
            Learning center
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            <EditableText id="learning.title" defaultValue="Grow your equity practice" />
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            <EditableText
              id="learning.subtitle"
              defaultValue="Continue your courses, connect learning to team goals, and follow your development journey in one place."
            />
          </p>
        </div>
        <Button asChild className="gap-2 self-start">
          <Link to="/training">
            Browse courses <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <PageToolbar title="Learning center" />

      <section className="overflow-hidden rounded-3xl bg-[#073b5c] text-white shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr] lg:p-10">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <GraduationCap className="h-6 w-6 text-[#b8dc7c]" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Your learning journey</p>
            <h2 className="mt-2 max-w-xl text-2xl font-semibold sm:text-3xl">Turn shared learning into better outcomes for Minnesotans.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              The learning center brings structured training, practical milestones, and measurable goals together so development continues beyond a single course.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-white/60">Journey progress</p>
                <p className="mt-1 text-4xl font-semibold">{overallProgress}%</p>
              </div>
              <span className="text-sm text-white/60">{completedChecklistItems} of {CHECKLIST_TOTAL} milestones</span>
            </div>
            <Progress value={overallProgress} className="mt-5 h-2 bg-white/15" />
            <Button asChild variant="secondary" className="mt-5 w-full justify-between">
              <Link to="/checklist">
                View completion checklist <ClipboardCheck className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/training" className="group">
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#003865]"><BookOpen className="h-5 w-5" /></div>
              <h2 className="mt-5 font-semibold">Training library</h2>
              <p className="mt-1 text-sm text-muted-foreground">Explore courses and curated learning paths.</p>
              <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#003865]">Explore training <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/goals" className="group">
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Target className="h-5 w-5" /></div>
              <h2 className="mt-5 font-semibold">Development goals</h2>
              <p className="mt-1 text-sm text-muted-foreground">Connect individual growth to division priorities.</p>
              <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#003865]">Review goals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/checklist" className="group">
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700"><ClipboardCheck className="h-5 w-5" /></div>
              <h2 className="mt-5 font-semibold">Completion checklist</h2>
              <p className="mt-1 text-sm text-muted-foreground">Track milestones across every learning phase.</p>
              <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-[#003865]">Track progress <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Continue learning</p>
                <h2 className="mt-1 text-xl font-semibold">Your courses</h2>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to="/training">View all</Link></Button>
            </div>
            <div className="mt-5 divide-y">
              {featuredCourses.map((course) => (
                <div key={course.title} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    {course.progress === 100 ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <BookOpen className="h-5 w-5 text-[#003865]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{course.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{course.detail}</p>
                    <Progress value={course.progress} className="mt-2 h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--mn-gold)/0.16)] text-amber-700"><Flag className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Roadmap</p>
                <h2 className="text-xl font-semibold">Three phases of practice</h2>
              </div>
            </div>
            <ol className="mt-6 space-y-5">
              {journey.map((phase, index) => (
                <li key={phase.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {index === 0 ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-slate-300" />}
                    {index < journey.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold">{phase.label}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{phase.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
