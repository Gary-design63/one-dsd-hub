import React, { useState } from "react";
import { Paperclip } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const communities = [
  {
    id: "1",
    name: "Anishinaabe (Ojibwe)",
    type: "Tribal Nation",
    scope: "Northern Minnesota — White Earth, Red Lake, Leech Lake regions",
    languages: ["English", "Ojibwemowin"],
    population: "~25,000 Anishinaabe in Minnesota",
    keyOrgs: ["White Earth Nation Services", "Anishinaabe Arts Initiative", "Ojibwe Language Society"],
    assets: ["Deep tradition of community governance", "Thriving language revitalization programs", "Strong intergenerational knowledge networks"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "2",
    name: "Dakota",
    type: "Tribal Nation",
    scope: "Southern Minnesota — historic Dakota homelands",
    languages: ["English", "Dakota"],
    population: "~8,500 Dakota people in Minnesota",
    keyOrgs: ["Dakota Wicohan", "Lower Sioux Agency", "Flandreau Santee Sioux Tribe liaison"],
    assets: ["Rich oral history traditions", "Growing Dakota language immersion programs", "Strong kinship networks"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "3",
    name: "Ho-Chunk (Winnebago)",
    type: "Tribal Nation",
    scope: "Southern Minnesota and cross-border communities",
    languages: ["English", "Ho-Chunk (Hoocak)"],
    population: "~2,800 Ho-Chunk in Minnesota",
    keyOrgs: ["Ho-Chunk Nation Cultural Resources", "Winnebago Community Center", "Ho-Chunk Youth Services"],
    assets: ["Strong cultural preservation efforts", "Active tribal governance participation", "Cross-state community coordination"],
    lastEngagement: "Dec 2025",
    status: "active"
  },
  {
    id: "4",
    name: "Mdewakanton",
    type: "Tribal Nation",
    scope: "Twin Cities Metro — Prior Lake, Shakopee area",
    languages: ["English", "Dakota"],
    population: "~1,200 enrolled Mdewakanton members",
    keyOrgs: ["Shakopee Mdewakanton Sioux Community", "Mdewakanton Emergency Services", "Playworks Education"],
    assets: ["Robust community investment programs", "Leading tribal enterprise models", "Strong philanthropic tradition"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "5",
    name: "Sisseton Wahpeton",
    type: "Tribal Nation",
    scope: "Western Minnesota and cross-border SD communities",
    languages: ["English", "Dakota"],
    population: "~3,500 Sisseton Wahpeton in Minnesota",
    keyOrgs: ["Sisseton Wahpeton Oyate services", "Lake Traverse Health Center", "Dakota Connection"],
    assets: ["Strong cross-border community ties", "Established health and wellness programs", "Active cultural preservation societies"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "6",
    name: "Upper Sioux",
    type: "Tribal Nation",
    scope: "Upper Minnesota River Valley — Granite Falls area",
    languages: ["English", "Dakota"],
    population: "~750 enrolled Upper Sioux members",
    keyOrgs: ["Upper Sioux Community Council", "Firefly Creek Cultural Center", "Upper Sioux Agency"],
    assets: ["Deep connection to ancestral lands", "Growing cultural tourism programs", "Active elder knowledge-keeper networks"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "7",
    name: "Lower Sioux",
    type: "Tribal Nation",
    scope: "Lower Minnesota River Valley — Morton area",
    languages: ["English", "Dakota"],
    population: "~900 enrolled Lower Sioux members",
    keyOrgs: ["Lower Sioux Indian Community", "Lower Sioux Health Center", "Cansayapi Heritage Center"],
    assets: ["Strong community health infrastructure", "Active language and culture programs", "Engaged youth leadership pipelines"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "8",
    name: "Prairie Island",
    type: "Tribal Nation",
    scope: "Southeast Minnesota — Welch area",
    languages: ["English", "Dakota"],
    population: "~1,100 enrolled Prairie Island members",
    keyOrgs: ["Prairie Island Indian Community", "Treasure Island Resort community programs", "Prairie Island Environmental Dept."],
    assets: ["Leading environmental stewardship programs", "Strong economic self-sufficiency models", "Active community wellness initiatives"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "9",
    name: "Red Lake Nation",
    type: "Tribal Nation",
    scope: "Northern Minnesota — Red Lake Reservation",
    languages: ["English", "Ojibwemowin"],
    population: "~11,000 enrolled Red Lake members",
    keyOrgs: ["Red Lake Nation Social Services", "Red Lake Hospital", "Red Lake Nation College"],
    assets: ["Sovereign nation with closed reservation status", "Strong tribal college and education system", "Comprehensive community health programs"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "10",
    name: "White Earth Nation",
    type: "Tribal Nation",
    scope: "Northwestern Minnesota — White Earth Reservation",
    languages: ["English", "Ojibwemowin"],
    population: "~20,000 enrolled White Earth members",
    keyOrgs: ["White Earth Tribal Council", "White Earth Mental Health Services", "Shooting Star Casino community programs"],
    assets: ["Largest Ojibwe nation in Minnesota", "Innovative constitutional reform leadership", "Strong community-based natural resource management"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "11",
    name: "Leech Lake Band",
    type: "Tribal Nation",
    scope: "North-Central Minnesota — Cass Lake area",
    languages: ["English", "Ojibwemowin"],
    population: "~9,500 enrolled Leech Lake members",
    keyOrgs: ["Leech Lake Band of Ojibwe Tribal Council", "Leech Lake Tribal College", "Bug-O-Nay-Ge-Shig School"],
    assets: ["Thriving tribal college and K-12 education", "Growing wild rice and natural foods economy", "Strong community-driven health programs"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "12",
    name: "Urban Native Communities",
    type: "Urban Indigenous",
    scope: "Twin Cities Metro — Minneapolis and St. Paul",
    languages: ["English", "Ojibwemowin", "Dakota"],
    population: "~35,000 urban Indigenous residents in Twin Cities",
    keyOrgs: ["Minneapolis American Indian Center", "Ain Dah Yung Center", "Upper Midwest American Indian Center"],
    assets: ["Vibrant urban Indigenous cultural organizations", "Multi-tribal community networks", "Strong advocacy and policy engagement traditions"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "13",
    name: "African American Minnesotans",
    type: "African American",
    scope: "Statewide with Twin Cities Metro focus",
    languages: ["English"],
    population: "~390,000 African American Minnesotans",
    keyOrgs: ["Minneapolis Urban League", "Northside Achievement Zone", "Black Visions Collective"],
    assets: ["Deep-rooted civic leadership traditions", "Thriving arts and cultural institutions", "Strong faith-based community networks"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "14",
    name: "Somali Communities",
    type: "East African",
    scope: "Twin Cities Metro — Minneapolis, Richfield, Brooklyn Park",
    languages: ["Somali", "English"],
    population: "~80,000 Somali Minnesotans",
    keyOrgs: ["Confederation of Somali Community in Minnesota", "Brian Coyle Community Center", "Ka Joog"],
    assets: ["Strong mutual aid and community networks", "Thriving entrepreneurial culture", "Engaged youth leadership organizations"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "15",
    name: "Oromo Communities",
    type: "East African",
    scope: "Twin Cities Metro — Minneapolis and St. Paul",
    languages: ["Oromo (Afaan Oromoo)", "English"],
    population: "~40,000 Oromo Minnesotans",
    keyOrgs: ["Oromo Community of Minnesota", "Oromo American Citizens Council", "Oromo Youth Association"],
    assets: ["Strong cultural identity and solidarity networks", "Growing civic engagement and advocacy", "Active cultural preservation programs"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "16",
    name: "Ethiopian/Eritrean Communities",
    type: "East African",
    scope: "Twin Cities Metro — Minneapolis, St. Paul, Brooklyn Park",
    languages: ["Amharic", "Tigrinya", "English"],
    population: "~30,000 Ethiopian and Eritrean Minnesotans",
    keyOrgs: ["Ethiopian Community in Minnesota", "Eritrean Community Center", "African Immigrant Community Services"],
    assets: ["Rich cultural heritage and communal traditions", "Strong intergenerational family networks", "Growing professional and business associations"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "17",
    name: "Hmong Communities",
    type: "Southeast Asian",
    scope: "Twin Cities and Central MN (St. Paul, Brooklyn Park, St. Cloud)",
    languages: ["Hmong", "English"],
    population: "~90,000 Hmong Minnesotans",
    keyOrgs: ["Hmong American Partnership", "Center for Hmong Arts and Talent (CHAT)", "Hmong Cultural Center"],
    assets: ["Largest urban Hmong population in the US", "Vibrant cultural arts and storytelling traditions", "Strong clan-based mutual support systems"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "18",
    name: "Karen Communities",
    type: "Southeast Asian",
    scope: "Twin Cities Metro — St. Paul, Maplewood",
    languages: ["S'gaw Karen", "English"],
    population: "~18,000 Karen Minnesotans",
    keyOrgs: ["Karen Organization of Minnesota", "Karen Youth Organization", "St. Paul Karen Baptist Church"],
    assets: ["Strong communal resilience and mutual aid", "Active cultural preservation and weaving traditions", "Growing civic engagement networks"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "19",
    name: "Vietnamese Communities",
    type: "Southeast Asian",
    scope: "Twin Cities Metro — Minneapolis and St. Paul",
    languages: ["Vietnamese", "English"],
    population: "~27,000 Vietnamese Minnesotans",
    keyOrgs: ["Vietnamese Social Services of Minnesota", "Vietnamese Cultural Association", "Trung Tam Viet Community Center"],
    assets: ["Established multi-generational community organizations", "Strong educational achievement traditions", "Vibrant cultural festivals and arts programs"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "20",
    name: "Filipino Communities",
    type: "SE Asian / Pacific",
    scope: "Twin Cities Metro and Rochester",
    languages: ["Filipino (Tagalog)", "English"],
    population: "~16,000 Filipino Minnesotans",
    keyOrgs: ["Filipino Minnesotans Association", "Philippine Cultural Foundation", "Filipino American Community Council"],
    assets: ["Strong professional networks in healthcare and education", "Vibrant cultural organizations and festivals", "Active civic participation traditions"],
    lastEngagement: "Dec 2025",
    status: "active"
  },
  {
    id: "21",
    name: "Latino/a/x Communities",
    type: "Latin American",
    scope: "Statewide — Twin Cities, Worthington, Marshall, Willmar",
    languages: ["Spanish", "English", "Indigenous languages (Mixtec, K'iche')"],
    population: "~330,000 Latino/a/x Minnesotans",
    keyOrgs: ["CLUES (Comunidades Latinas Unidas En Servicio)", "Navigate MN", "Centro Tyrone Guzman"],
    assets: ["Strong family and community solidarity networks", "Thriving small business and entrepreneurial culture", "Growing civic leadership and advocacy organizations"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "22",
    name: "LGBTQ+ Communities",
    type: "Cross-cutting Identity",
    scope: "Statewide with Twin Cities Metro focus",
    languages: ["English", "Multiple community languages"],
    population: "~250,000 LGBTQ+ Minnesotans (est.)",
    keyOrgs: ["OutFront Minnesota", "Trans Lifeline Midwest", "Rainbow Health Minnesota"],
    assets: ["Strong advocacy and policy change traditions", "Vibrant arts, culture, and community spaces", "Intersectional organizing expertise"],
    lastEngagement: "Mar 2026",
    status: "active"
  },
  {
    id: "23",
    name: "German Heritage",
    type: "European Heritage",
    scope: "Statewide — Central and Southern Minnesota",
    languages: ["English", "German (heritage)"],
    population: "~1.9 million Minnesotans of German descent",
    keyOrgs: ["Germanic-American Institute", "Stearns History Museum", "New Ulm Heritage Foundation"],
    assets: ["Deep agricultural and civic institution roots", "Strong community festival and cultural traditions", "Extensive rural community networks"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "24",
    name: "Swedish Heritage",
    type: "European Heritage",
    scope: "Statewide — Twin Cities, Central, and Northern MN",
    languages: ["English", "Swedish (heritage)"],
    population: "~600,000 Minnesotans of Swedish descent",
    keyOrgs: ["American Swedish Institute", "Swedish Cultural Society of MN", "Gustavus Adolphus Heritage Programs"],
    assets: ["Historic contributions to Minnesota's cooperative movements", "Strong arts and cultural institutions", "Enduring community gathering traditions"],
    lastEngagement: "Dec 2025",
    status: "active"
  },
  {
    id: "25",
    name: "Norwegian Heritage",
    type: "European Heritage",
    scope: "Statewide — Western and Northern Minnesota",
    languages: ["English", "Norwegian (heritage)"],
    population: "~900,000 Minnesotans of Norwegian descent",
    keyOrgs: ["Sons of Norway", "Vesterheim Heritage Programs", "Norwegian American Historical Association"],
    assets: ["Deep rural and faith-based community traditions", "Strong volunteer and mutual aid heritage", "Active cultural preservation societies"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "26",
    name: "Ukrainian Communities",
    type: "Eastern European",
    scope: "Twin Cities Metro and growing communities statewide",
    languages: ["Ukrainian", "English"],
    population: "~12,000 Ukrainian Minnesotans",
    keyOrgs: ["Ukrainian American Community Center", "Ukrainian Cultural Institute of MN", "MN Ukrainian Relief Committee"],
    assets: ["Strong mutual support and newcomer assistance networks", "Active cultural and church-based organizations", "Resilient and adaptive community leadership"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "27",
    name: "Russian-speaking Communities",
    type: "Eastern European",
    scope: "Twin Cities Metro",
    languages: ["Russian", "English"],
    population: "~15,000 Russian-speaking Minnesotans",
    keyOrgs: ["Russian Cultural Community Center", "MN Slavic Cultural Association", "International Institute of Minnesota"],
    assets: ["Strong educational and professional networks", "Rich arts and literary cultural traditions", "Active community centers and gathering spaces"],
    lastEngagement: "Jan 2026",
    status: "active"
  },
  {
    id: "28",
    name: "Arab/MENA Communities",
    type: "MENA",
    scope: "Twin Cities Metro — Minneapolis, St. Paul, suburbs",
    languages: ["Arabic", "English"],
    population: "~20,000 Arab/MENA Minnesotans",
    keyOrgs: ["American Arab Anti-Discrimination Committee MN", "Islamic Resource Group", "CommonBond Communities MENA outreach"],
    assets: ["Strong faith-based community organizations", "Thriving business and professional networks", "Active civic engagement and advocacy traditions"],
    lastEngagement: "Feb 2026",
    status: "active"
  },
  {
    id: "29",
    name: "Native Hawaiian/Pacific Islander",
    type: "Pacific Islander",
    scope: "Twin Cities Metro — scattered communities",
    languages: ["English", "Hawaiian", "Samoan", "Tongan"],
    population: "~3,000 NHPI Minnesotans",
    keyOrgs: ["Pacific Islander Community Association of MN", "Pacific Islanders in Communications", "MN NHPI Coalition"],
    assets: ["Strong family and communal gathering traditions", "Rich cultural practices and performing arts", "Growing community organizing capacity"],
    lastEngagement: "Dec 2025",
    status: "active"
  },
  {
    id: "30",
    name: "West African Communities",
    type: "West African",
    scope: "Twin Cities Metro — Brooklyn Park, Brooklyn Center, Plymouth",
    languages: ["English", "French", "Wolof", "Mandinka"],
    population: "~25,000 West African Minnesotans",
    keyOrgs: ["West African Family & Community Services", "Association des Senegalais du Minnesota", "African Career & Education Resource"],
    assets: ["Strong communal and extended family networks", "Vibrant cultural and artistic traditions", "Active business and professional communities"],
    lastEngagement: "Feb 2026",
    status: "active"
  }
];

const engagementHistory = [
  { date: "Mar 15, 2026", community: "Somali Communities", type: "Listening Session", attendees: 47, themes: ["Language access", "Community trust", "Youth programs"] },
  { date: "Mar 10, 2026", community: "Latino/a/x Communities", type: "Advisory Panel", attendees: 12, themes: ["Navigation support", "Greater MN gaps", "Workforce development"] },
  { date: "Feb 28, 2026", community: "African American Minnesotans", type: "Focus Group", attendees: 18, themes: ["Economic opportunity", "Community wellness", "Youth engagement"] },
  { date: "Feb 14, 2026", community: "Hmong Communities", type: "Community Meeting", attendees: 35, themes: ["Elder services", "Language services", "Cultural programs"] },
  { date: "Jan 25, 2026", community: "Red Lake Nation", type: "Listening Session", attendees: 22, themes: ["Reservation services", "Cultural safety", "Tribal-state coordination"] },
  { date: "Jan 18, 2026", community: "Karen Communities", type: "Community Meeting", attendees: 28, themes: ["Language access", "Resettlement support", "Youth leadership"] }
];

const typeColors: Record<string, string> = {
  "Tribal Nation": "bg-amber-100 text-amber-800",
  "Urban Indigenous": "bg-amber-100 text-amber-800",
  "African American": "bg-[#003865]/10 text-[#003865]",
  "East African": "bg-green-100 text-green-800",
  "Southeast Asian": "bg-purple-100 text-purple-800",
  "SE Asian / Pacific": "bg-purple-100 text-purple-800",
  "Latin American": "bg-orange-100 text-orange-800",
  "Cross-cutting Identity": "bg-pink-100 text-pink-800",
  "European Heritage": "bg-sky-100 text-sky-800",
  "Eastern European": "bg-sky-100 text-sky-800",
  "MENA": "bg-teal-100 text-teal-800",
  "Pacific Islander": "bg-cyan-100 text-cyan-800",
  "West African": "bg-green-100 text-green-800"
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<typeof communities[0] | null>(null);

  const filtered = communities.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const uniqueLanguages = new Set(communities.flatMap(c => c.languages));

  return (
    <div className="p-6 space-y-6">
      <PageToolbar title="Community Partnerships" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <EditableText id="community.title" defaultValue="Community Partnerships" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <EditableText id="community.subtitle" defaultValue={`${communities.length} community partnerships — All communities represented equally`} />
          </p>
        </div>
        <Button className="gap-2">
          <span className="text-sm font-bold">+</span>
          Add Community
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{communities.length}</div>
            <div className="text-sm text-muted-foreground">Community Partnerships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#78BE21]">{communities.reduce((sum, c) => sum + c.keyOrgs.length, 0)}</div>
            <div className="text-sm text-muted-foreground">Partner Organizations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{uniqueLanguages.size}</div>
            <div className="text-sm text-muted-foreground">Languages Represented</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{engagementHistory.length}</div>
            <div className="text-sm text-muted-foreground">Recent Engagements</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="communities">
        <TabsList>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="engagement">Engagement History</TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Input
              placeholder="Search communities, types, or languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(community => (
              <Card
                key={community.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCommunity?.id === community.id ? "ring-2 ring-[#003865]" : ""}`}
                onClick={() => setSelectedCommunity(community.id === selectedCommunity?.id ? null : community)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003865]/10 flex items-center justify-center flex-shrink-0 text-[#003865] font-bold text-lg">
                        {getInitial(community.name)}
                      </div>
                      <div>
                        <CardTitle className="text-sm leading-tight">{community.name}</CardTitle>
                        <span className="text-xs text-muted-foreground">{community.scope}</span>
                      </div>
                    </div>
                    <Badge className={`text-xs border-0 whitespace-nowrap ${typeColors[community.type] || "bg-gray-100 text-gray-700"}`}>
                      {community.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{community.population}</p>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1">
                    {community.languages.map(lang => (
                      <span key={lang} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Key Organizations */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Key Organizations</p>
                    <div className="flex flex-wrap gap-1">
                      {community.keyOrgs.map((org, i) => (
                        <span key={i} className="text-xs bg-[#003865]/5 text-[#003865] px-2 py-0.5 rounded">
                          {org}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assets */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Community Assets</p>
                    <ul className="space-y-1">
                      {community.assets.map((asset, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-[#78BE21] mt-0.5">•</span>
                          {asset}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Last engaged: {community.lastEngagement}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      View details {">"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Community Engagement History</CardTitle>
              <CardDescription>Recent listening sessions, advisory panels, and community meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementHistory.map((event, i) => (
                  <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-xs font-medium text-foreground">{event.date}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.attendees} attendees</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium">{event.community}</p>
                        <Badge className="bg-[#003865]/10 text-[#003865] border-0 text-xs">{event.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.themes.map(theme => (
                          <span key={theme} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs flex-shrink-0">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
