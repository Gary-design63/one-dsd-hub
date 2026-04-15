import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  Legend,
  Cell
} from "recharts";

const waiverAccessData = [
  { group: "White", cadi: 62, dd: 55, bi: 48, ew: 71 },
  { group: "Black/AA", cadi: 38, dd: 31, bi: 29, ew: 42 },
  { group: "Indigenous", cadi: 31, dd: 28, bi: 22, ew: 38 },
  { group: "Latinx", cadi: 44, dd: 38, bi: 34, ew: 47 },
  { group: "Asian/PI", cadi: 49, dd: 45, bi: 38, ew: 53 },
  { group: "Somali", cadi: 36, dd: 29, bi: 24, ew: 40 }
];

const employmentData = [
  { quarter: "Q1 '24", black: 16, indigenous: 13, latinx: 20, asian: 29, white: 39 },
  { quarter: "Q2 '24", black: 17, indigenous: 13, latinx: 21, asian: 30, white: 40 },
  { quarter: "Q3 '24", black: 17, indigenous: 14, latinx: 21, asian: 30, white: 40 },
  { quarter: "Q4 '24", black: 18, indigenous: 14, latinx: 22, asian: 31, white: 41 }
];

const waitlistData = [
  { county: "Hennepin", total: 820, bipoc: 450, percent: 54.9 },
  { county: "Ramsey", total: 610, bipoc: 310, percent: 50.8 },
  { county: "Anoka", total: 380, bipoc: 140, percent: 36.8 },
  { county: "Dakota", total: 290, bipoc: 95, percent: 32.8 },
  { county: "St. Louis", total: 270, bipoc: 62, percent: 23.0 },
  { county: "Washington", total: 195, bipoc: 58, percent: 29.7 }
];

const languageAccessData = [
  { language: "Spanish", requests: 4820, fulfilled: 4650, rate: 96.5 },
  { language: "Somali", requests: 3210, fulfilled: 2890, rate: 90.0 },
  { language: "Hmong", requests: 2100, fulfilled: 1980, rate: 94.3 },
  { language: "Vietnamese", requests: 890, fulfilled: 850, rate: 95.5 },
  { language: "Oromo", requests: 640, fulfilled: 510, rate: 79.7 },
  { language: "Arabic", requests: 420, fulfilled: 370, rate: 88.1 }
];

const equityRadarData = [
  { metric: "Waiver Access", value: 58, benchmark: 80 },
  { metric: "Employment", value: 45, benchmark: 80 },
  { metric: "Language Access", value: 72, benchmark: 80 },
  { metric: "Provider Diversity", value: 41, benchmark: 80 },
  { metric: "Community Voice", value: 63, benchmark: 80 },
  { metric: "Data Quality", value: 55, benchmark: 80 }
];

const COLORS = ["#003865", "#78BE21", "#1e3a5f", "#4a90d9", "#94a3b8", "#e97316"];

function DisparityBadge({ ratio }: { ratio: number }) {
  if (ratio <= 1.1) return <Badge className="bg-green-100 text-green-700 border-0">Low Gap</Badge>;
  if (ratio <= 1.3) return <Badge className="bg-amber-100 text-amber-700 border-0">Moderate Gap</Badge>;
  if (ratio <= 1.6) return <Badge className="bg-orange-100 text-orange-700 border-0">Significant Gap</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-0">Critical Gap</Badge>;
}

function TrendIcon({ trend }: { trend: "improving" | "stable" | "worsening" }) {
  if (trend === "improving") return <span className="text-green-500 text-xs font-bold">↑</span>;
  if (trend === "worsening") return <span className="text-red-500 text-xs font-bold">↓</span>;
  return <span className="text-muted-foreground text-xs">−</span>;
}

export default function EquityMetricsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <EditableText id="metrics.title" defaultValue="Equity Metrics Dashboard" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <EditableText id="metrics.subtitle" defaultValue="Disaggregated disability services data · Minnesota DSD · Q4 2024" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Download
          </Button>
        </div>
      </div>

      <PageToolbar title="Equity Metrics" />

      {/* Alert banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-red-600 font-bold flex-shrink-0">!</span>
        <div>
          <p className="text-sm font-medium text-red-800">3 Critical Equity Alerts</p>
          <p className="text-xs text-red-700 mt-0.5">
            Black/AA employment gap now 23 points below state average · Somali language access fulfilled at 90.0% (below 95% target) · Indigenous waiver access ratio 2.0x below White rate
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Overall Equity Index",
            value: "56 / 100",
            trend: "improving" as const,
            trendLabel: "+3 pts from Q3",
            description: "Composite equity score across 6 domains",
            status: "warning"
          },
          {
            label: "Largest Employment Gap",
            value: "23 pts",
            trend: "stable" as const,
            trendLabel: "Black/AA vs White",
            description: "18% vs 41% competitive employment",
            status: "critical"
          },
          {
            label: "Language Access Rate",
            value: "90.6%",
            trend: "improving" as const,
            trendLabel: "+1.2% from last quarter",
            description: "Requests fulfilled across all languages",
            status: "warning"
          },
          {
            label: "BIPOC Waitlist Share",
            value: "44.7%",
            trend: "improving" as const,
            trendLabel: "-2.1% this quarter",
            description: "BIPOC members as share of total waitlist",
            status: "warning"
          }
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <TrendIcon trend={kpi.trend} />
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.trendLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="access">Waiver Access</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="language">Language Access</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlists</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equity radar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Equity Score by Domain</CardTitle>
                <CardDescription>Score vs 80-point equity benchmark · Q4 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={equityRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <Radar name="Current Score" dataKey="value" stroke="#003865" fill="#003865" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Target (80)" dataKey="benchmark" stroke="#78BE21" fill="#78BE21" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key disparity summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disparity Ratios by Population</CardTitle>
                <CardDescription>White rate set as 1.0 reference · Lower = larger gap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { group: "Black/African American", waiverRatio: 0.61, employmentRatio: 0.44, trend: "improving" as const },
                  { group: "American Indian/Alaska Native", waiverRatio: 0.50, employmentRatio: 0.34, trend: "stable" as const },
                  { group: "Latinx/Hispanic", waiverRatio: 0.71, employmentRatio: 0.54, trend: "improving" as const },
                  { group: "Asian/Pacific Islander", waiverRatio: 0.79, employmentRatio: 0.76, trend: "improving" as const },
                  { group: "Somali/East African", waiverRatio: 0.58, employmentRatio: 0.41, trend: "worsening" as const }
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{row.group}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Waiver: {row.waiverRatio.toFixed(2)}x</span>
                        <span>Employment: {row.employmentRatio.toFixed(2)}x</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DisparityBadge ratio={1 / row.waiverRatio} />
                      <TrendIcon trend={row.trend} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Waiver Access Tab */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Waiver Enrollment Rate by Race/Ethnicity</CardTitle>
              <CardDescription>Per 1,000 eligible population · All waivers · Q4 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waiverAccessData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="cadi" name="CADI" fill="#003865" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="dd" name="DD" fill="#78BE21" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="bi" name="Brain Injury" fill="#4a90d9" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="ew" name="Elderly" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { waiver: "CADI Waiver", whiteRate: 62, lowestRate: 31, lowestGroup: "Indigenous", gap: 31 },
              { waiver: "DD Waiver", whiteRate: 55, lowestRate: 28, lowestGroup: "Indigenous", gap: 27 },
              { waiver: "Brain Injury", whiteRate: 48, lowestRate: 22, lowestGroup: "Indigenous", gap: 26 }
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold">{item.waiver}</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>White (highest)</span>
                        <span>{item.whiteRate}/1,000</span>
                      </div>
                      <Progress value={(item.whiteRate / 80) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{item.lowestGroup} (lowest)</span>
                        <span>{item.lowestRate}/1,000</span>
                      </div>
                      <Progress value={(item.lowestRate / 80) * 100} className="h-2 [&>div]:bg-red-500" />
                    </div>
                    <p className="text-xs text-red-600 font-medium">{item.gap}-point access gap</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Employment Tab */}
        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Competitive Integrated Employment Rate</CardTitle>
              <CardDescription>% of working-age waiver participants employed at or above minimum wage · 2024 by quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={employmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="white" name="White" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="asian" name="Asian/PI" stroke="#4a90d9" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="latinx" name="Latinx" stroke="#78BE21" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="black" name="Black/AA" stroke="#003865" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="indigenous" name="Indigenous" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employment First Priority Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: "Launch culturally specific employment supports for Black/AA job seekers", priority: "Critical", owner: "DSD Employment Team" },
                  { action: "Expand Oromo-speaking job coaching staff in Hennepin County", priority: "High", owner: "County Partnership" },
                  { action: "VRS-waiver coordination protocol for Indigenous communities in NW MN", priority: "High", owner: "VRS + DSD" },
                  { action: "Customized employment pilots for Somali communities in St. Paul", priority: "Medium", owner: "Ramsey County" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <Badge className={
                      item.priority === "Critical" ? "bg-red-100 text-red-700 border-0 flex-shrink-0" :
                      item.priority === "High" ? "bg-amber-100 text-amber-700 border-0 flex-shrink-0" :
                      "bg-blue-100 text-blue-700 border-0 flex-shrink-0"
                    }>{item.priority}</Badge>
                    <div>
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Owner: {item.owner}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employment Gap Summary</CardTitle>
                <CardDescription>vs. White employment rate (41%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { group: "Black/African American", rate: 18, gap: 23 },
                  { group: "American Indian/AK Native", rate: 14, gap: 27 },
                  { group: "Somali/East African", rate: 16, gap: 25 },
                  { group: "Latinx/Hispanic", rate: 22, gap: 19 },
                  { group: "Asian/Pacific Islander", rate: 31, gap: 10 }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.group}</span>
                      <span className="text-muted-foreground">{item.rate}% <span className="text-red-600">(-{item.gap}pts)</span></span>
                    </div>
                    <Progress value={(item.rate / 50) * 100} className="h-2 [&>div]:bg-[#003865]" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Language Access Tab */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Language Access Request Fulfillment</CardTitle>
              <CardDescription>DSD services across primary non-English languages · 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageAccessData.map((lang, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium w-24">{lang.language}</span>
                      <span className="text-muted-foreground">{lang.requests.toLocaleString()} requests</span>
                      <span className={`font-semibold ${lang.rate >= 95 ? "text-green-600" : lang.rate >= 90 ? "text-amber-600" : "text-red-600"}`}>
                        {lang.rate}%
                      </span>
                      <Badge className={`border-0 ${lang.rate >= 95 ? "bg-green-100 text-green-700" : lang.rate >= 90 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {lang.rate >= 95 ? "On Target" : lang.rate >= 90 ? "Below Target" : "Critical Gap"}
                      </Badge>
                    </div>
                    <Progress
                      value={lang.rate}
                      className={`h-2 ${lang.rate < 90 ? "[&>div]:bg-red-500" : lang.rate < 95 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
                <span className="font-bold mr-1">i</span>
                Target: 95%+ fulfillment for all languages. Oromo is critically below target at 79.7%. DHS Title VI obligation.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Waitlist by County — Top 6 Counties</CardTitle>
              <CardDescription>Total waitlist and BIPOC share · Q4 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={waitlistData} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="county" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Total Waitlist" fill="#003865" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="bipoc" name="BIPOC Members" fill="#78BE21" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {waitlistData.map((county, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{county.county} County</p>
                    <Badge className={`border-0 ${county.percent > 50 ? "bg-red-100 text-red-700" : county.percent > 35 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {county.percent}% BIPOC
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total on waitlist:</span>
                      <span className="font-medium text-foreground">{county.total}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>BIPOC members:</span>
                      <span className="font-medium text-foreground">{county.bipoc}</span>
                    </div>
                    <Progress value={county.percent} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
