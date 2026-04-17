import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const courses = [
  {
    id: "c1",
    title: "Disability Justice Foundations",
    description: "Introduces disability justice framework, cross-movement solidarity, and the shift from charity to justice model. Includes historical context of institutionalization and eugenics.",
    category: "disability_justice",
    level: "foundational",
    duration: 90,
    audience: ["all_staff", "leadership", "providers"],
    status: "published",
    format: "online",
    languages: ["English", "Spanish", "Somali"],
    completions: 847,
    rating: 4.8,
    completionRate: 91,
    certification: true,
    meta_skills: ["M1-01", "M1-06", "M1-03"],
    new: false
  },
  {
    id: "c2",
    title: "Structural Racism and Disability Intersections",
    description: "Deep dive into how structural racism creates and maintains disability disparities in Minnesota. Case studies from CADI, DD, and Employment First data.",
    category: "equity_foundations",
    level: "intermediate",
    duration: 120,
    audience: ["supervisors", "leadership", "policy_analysts"],
    status: "published",
    format: "hybrid",
    languages: ["English"],
    completions: 412,
    rating: 4.9,
    completionRate: 88,
    certification: true,
    meta_skills: ["M1-01", "M1-02", "M3-01"],
    new: false
  },
  {
    id: "c3",
    title: "Cultural Responsiveness for East African Communities",
    description: "Equips DSPs and case managers to provide culturally responsive services to Somali, Ethiopian, Eritrean, and other East African families. Includes stigma context and family structures.",
    category: "cultural_responsiveness",
    level: "intermediate",
    duration: 60,
    audience: ["all_staff", "providers"],
    status: "published",
    format: "online",
    languages: ["English", "Somali"],
    completions: 589,
    rating: 4.7,
    completionRate: 93,
    certification: false,
    meta_skills: ["M2-04", "M6-03"],
    new: false
  },
  {
    id: "c4",
    title: "Employment First: From Policy to Practice",
    description: "Full Employment First curriculum covering MN statute 268A.15, VRS coordination, customized employment, and addressing racial employment disparities.",
    category: "employment_first",
    level: "intermediate",
    duration: 180,
    audience: ["all_staff", "providers", "county"],
    status: "published",
    format: "hybrid",
    languages: ["English", "Spanish"],
    completions: 934,
    rating: 4.6,
    completionRate: 85,
    certification: true,
    meta_skills: ["M1-01", "M4-01", "M4-06"],
    new: false
  },
  {
    id: "c5",
    title: "Minnesota Waiver Programs: CADI, DD, BI, EW, AC",
    description: "Complete guide to Minnesota's five waiver programs. Covers eligibility, services, CBSM references, and equity implications in access and waitlist management.",
    category: "waiver_programs",
    level: "foundational",
    duration: 150,
    audience: ["all_staff", "county", "providers"],
    status: "published",
    format: "self_paced",
    languages: ["English", "Spanish", "Hmong", "Somali"],
    completions: 1284,
    rating: 4.5,
    completionRate: 89,
    certification: true,
    meta_skills: ["M4-01", "M2-01"],
    new: false
  },
  {
    id: "c6",
    title: "Olmstead Plan and HCBS Settings Rule",
    description: "Covers Minnesota's Olmstead obligations, community integration requirements, and HCBS Settings Rule compliance for residential and day service providers.",
    category: "olmstead",
    level: "intermediate",
    duration: 120,
    audience: ["all_staff", "leadership", "providers"],
    status: "published",
    format: "online",
    languages: ["English"],
    completions: 721,
    rating: 4.7,
    completionRate: 87,
    certification: true,
    meta_skills: ["M4-01", "M4-02", "M1-06"],
    new: false
  },
  {
    id: "c7",
    title: "Data Literacy for Equity Work",
    description: "Teaches staff how to read, interpret, and communicate disaggregated equity data. Covers disparity ratios, root cause analysis, and equity data storytelling.",
    category: "data_literacy",
    level: "intermediate",
    duration: 90,
    audience: ["all_staff", "supervisors", "leadership"],
    status: "published",
    format: "online",
    languages: ["English"],
    completions: 445,
    rating: 4.8,
    completionRate: 86,
    certification: false,
    meta_skills: ["M3-01", "M3-05", "M3-02"],
    new: false
  },
  {
    id: "c8",
    title: "Language Justice and Accessible Communication",
    description: "Practical skills for ensuring language access, creating plain language materials, and designing accessible communications for people with various disabilities.",
    category: "equity_foundations",
    level: "foundational",
    duration: 75,
    audience: ["all_staff"],
    status: "published",
    format: "online",
    languages: ["English", "Spanish", "Somali", "Hmong"],
    completions: 1156,
    rating: 4.6,
    completionRate: 94,
    certification: false,
    meta_skills: ["M2-01", "M2-02", "M2-03"],
    new: false
  },
  {
    id: "c9",
    title: "DWRS 2026: Rate System Equity Analysis",
    description: "Equips leaders and policy staff to analyze the 2026 DWRS transition for equity impacts on BIPOC-owned providers, rural providers, and DSP wages.",
    category: "waiver_programs",
    level: "advanced",
    duration: 150,
    audience: ["leadership", "supervisors"],
    status: "published",
    format: "live_virtual",
    languages: ["English"],
    completions: 123,
    rating: 4.9,
    completionRate: 92,
    certification: false,
    meta_skills: ["M3-01", "M4-01", "M5-05"],
    new: true
  },
  {
    id: "c10",
    title: "Community-Led Co-Design Facilitation",
    description: "Builds facilitation skills for staff who run community co-design processes. Covers power dynamics, compensation, authentic participation, and accountability.",
    category: "community_engagement",
    level: "advanced",
    duration: 240,
    audience: ["supervisors", "leadership"],
    status: "draft",
    format: "in_person",
    languages: ["English"],
    completions: 0,
    rating: 0,
    completionRate: 0,
    certification: true,
    meta_skills: ["M6-02", "M6-04", "M6-01"],
    new: true
  }
];

const learningPaths = [
  {
    id: "lp1",
    name: "New Equity Staff Onboarding",
    courses: 4,
    duration: 435,
    completions: 89,
    description: "Essential equity foundations for all new DSD staff"
  },
  {
    id: "lp2",
    name: "Cultural Competency Certificate",
    courses: 5,
    duration: 540,
    completions: 234,
    description: "Comprehensive cultural responsiveness training series"
  },
  {
    id: "lp3",
    name: "Employment First Champion Certification",
    courses: 3,
    duration: 330,
    completions: 178,
    description: "For staff leading Employment First implementation"
  },
  {
    id: "lp4",
    name: "Waiver Programs Specialist Track",
    courses: 4,
    duration: 480,
    completions: 412,
    description: "Deep expertise across all Minnesota waiver programs"
  }
];

const categoryColors: Record<string, string> = {
  disability_justice: "bg-purple-100 text-purple-700",
  equity_foundations: "bg-blue-100 text-blue-700",
  cultural_responsiveness: "bg-orange-100 text-orange-700",
  employment_first: "bg-teal-100 text-teal-700",
  waiver_programs: "bg-indigo-100 text-indigo-700",
  olmstead: "bg-green-100 text-green-700",
  data_literacy: "bg-cyan-100 text-cyan-700",
  community_engagement: "bg-pink-100 text-pink-700"
};

const categoryLabels: Record<string, string> = {
  disability_justice: "Disability Justice",
  equity_foundations: "Equity Foundations",
  cultural_responsiveness: "Cultural Responsiveness",
  employment_first: "Employment First",
  waiver_programs: "Waiver Programs",
  olmstead: "Olmstead",
  data_literacy: "Data Literacy",
  community_engagement: "Community Engagement",
  leadership: "Leadership"
};

const levelBadge: Record<string, string> = {
  foundational: "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  advanced: "bg-purple-50 text-purple-700 border-purple-200",
  expert: "bg-red-50 text-red-700 border-red-200"
};

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = courses.filter(c => {
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || c.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const totalCompletions = courses.reduce((s, c) => s + c.completions, 0);
  const avgRating = courses.filter(c => c.rating > 0).reduce((s, c) => s + c.rating, 0) / courses.filter(c => c.rating > 0).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <EditableText id="training.title" defaultValue="Equity Training and Education" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <EditableText id="training.subtitle" defaultValue={`${courses.length} courses · ${totalCompletions.toLocaleString()} completions · 5–8 person equity team equivalent`} />
          </p>
        </div>
        <Button className="gap-2">
          <span>+</span>
          Create Course
        </Button>
      </div>

      <PageToolbar title="Equity Training and Education" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{courses.filter(c => c.status === "published").length}</div>
            <div className="text-sm text-muted-foreground">Published Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#78BE21]">{totalCompletions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Completions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{avgRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Course Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{learningPaths.length}</div>
            <div className="text-sm text-muted-foreground">Learning Paths</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="foundational">Foundational</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(course => (
              <Card key={course.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${levelBadge[course.level]}`}>
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </span>
                      {course.new && (
                        <Badge className="bg-[#78BE21] text-white border-0 text-xs">New</Badge>
                      )}
                      {course.status === "draft" && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Draft</Badge>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[course.category] || "bg-gray-100 text-gray-700"}`}>
                      {categoryLabels[course.category]}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold leading-snug">{course.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {course.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      {course.completions.toLocaleString()} completed
                    </span>
                    {course.rating > 0 && (
                      <span className="flex items-center gap-1">
                        {course.rating}
                      </span>
                    )}
                    {course.certification && (
                      <span className="flex items-center gap-1 text-[#78BE21]">
                        Certificate
                      </span>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1">
                    {course.languages.map(lang => (
                      <span key={lang} className="text-xs bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Completion rate */}
                  {course.completionRate > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Completion rate</span>
                        <span className="font-medium text-foreground">{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="h-1.5" />
                    </div>
                  )}

                  {/* Meta-skills */}
                  <div className="flex flex-wrap gap-1">
                    {course.meta_skills.map(skill => (
                      <span key={skill} className="text-xs bg-[#003865]/10 text-[#003865] px-1.5 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-2">
                    <Button size="sm" className="w-full gap-2" variant={course.status === "draft" ? "outline" : "default"}>
                      {course.status === "draft" ? "Preview Draft" : "Launch Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paths" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map(path => (
              <Card key={path.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#003865]/10 flex items-center justify-center">
                      <span className="text-[#003865] font-semibold text-sm">LP</span>
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{path.name}</CardTitle>
                      <CardDescription className="text-xs">{path.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {path.courses} courses
                    </span>
                    <span className="flex items-center gap-1">
                      {Math.round(path.duration / 60)}h {path.duration % 60}m
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> {path.completions} completed
                    </span>
                  </div>
                  <Button size="sm" className="w-full mt-4 gap-2">
                    Start Path <span>{">"}</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
