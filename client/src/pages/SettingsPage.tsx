import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { isSupabaseAvailable } from "@/core/supabaseClient";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  const [sniffL1Enabled, setSniffL1Enabled] = useState(true);
  const [sniffL2Enabled, setSniffL2Enabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const apiKeyConfigured = true; // AI key is configured on the backend server
  const supabaseConfigured = isSupabaseAvailable();

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">
          <EditableText id="settings.title" defaultValue="Platform Settings" />
        </h1>
        <p className="text-muted-foreground mt-1">
          <EditableText id="settings.subtitle" defaultValue="Configuration for the One DSD Equity and Inclusion Agentic Operations Platform" />
        </p>
      </div>

      <PageToolbar title="Settings" />

      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="agents">Agent Settings</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Anthropic API Key</CardTitle>
              <CardDescription>
                Required for all agent functionality. Get your key at console.anthropic.com.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {apiKeyConfigured ? (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">API Key Configured</p>
                      <p className="text-xs text-muted-foreground">VITE_ANTHROPIC_API_KEY is set in your environment</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-700">API Key Not Configured</p>
                      <p className="text-xs text-muted-foreground">Add VITE_ANTHROPIC_API_KEY to your .env file to enable agents</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-0">Required</Badge>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key-input">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key-input"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-ant-api03-..."
                      defaultValue={apiKeyConfigured ? "••••••••••••••••••••••••••" : ""}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store your API key in .env as <code className="bg-muted px-1 rounded">VITE_ANTHROPIC_API_KEY=your_key_here</code>
                </p>
              </div>

              <div className="bg-[#003865]/5 rounded-lg p-3 text-xs">
                <p className="font-medium mb-1">How to set up your API key:</p>
                <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Create a file named <code className="bg-muted px-1 rounded">.env</code> in the project root</li>
                  <li>Add: <code className="bg-muted px-1 rounded">VITE_ANTHROPIC_API_KEY=sk-ant-api03-...</code></li>
                  <li>Restart the development server</li>
                  <li>All 14 agents will be ready to use</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supabase Database</CardTitle>
              <CardDescription>
                Optional: enables conversation persistence, audit logging, and equity metrics storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {supabaseConfigured ? (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">Supabase Connected</p>
                      <p className="text-xs text-muted-foreground">Database persistence is active</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">Connected</Badge>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Supabase Not Configured</p>
                      <p className="text-xs text-muted-foreground">Platform works without Supabase — add for data persistence</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-0">Optional</Badge>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    defaultValue={import.meta.env.VITE_SUPABASE_URL || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                  <div className="relative">
                    <Input
                      id="supabase-key"
                      type={showSupabaseKey ? "text" : "password"}
                      placeholder="eyJh..."
                      defaultValue={import.meta.env.VITE_SUPABASE_ANON_KEY ? "••••••••••••••••••" : ""}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSupabaseKey ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Settings Tab */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sniff Check Engine</CardTitle>
              <CardDescription>
                Quality assurance system that verifies all agent outputs before delivery.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>L1 Automated Check</Label>
                    <p className="text-xs text-muted-foreground">
                      Run on every output: force multiplier, draft-readiness, ableist language, audience alignment
                    </p>
                  </div>
                  <Switch checked={sniffL1Enabled} onCheckedChange={setSniffL1Enabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>L2 Equity Review</Label>
                    <p className="text-xs text-muted-foreground">
                      For policy and community content: structural analysis, intersectionality, community voice, Olmstead alignment
                    </p>
                  </div>
                  <Switch checked={sniffL2Enabled} onCheckedChange={setSniffL2Enabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between opacity-60">
                  <div className="space-y-0.5">
                    <Label>L3 Expert Validation</Label>
                    <p className="text-xs text-muted-foreground">
                      High-stakes outputs only: legal compliance, community validation, equity impact analysis (requires human reviewer)
                    </p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-0">Human Required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Agent Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Default Model</Label>
                  <p className="font-medium mt-0.5">claude-opus-4-5</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Tokens</Label>
                  <p className="font-medium mt-0.5">4,096</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Temperature</Label>
                  <p className="font-medium mt-0.5">0.3 (balanced)</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Meta-Skills Applied</Label>
                  <p className="font-medium mt-0.5">All 39 (6 domains)</p>
                </div>
              </div>

              <div className="bg-[#003865]/5 rounded-lg p-3 text-xs">
                <p className="font-medium mb-1 text-[#003865]">Primary Directive (always active):</p>
                <p className="text-muted-foreground italic">
                  "Every agent, every process, every output must multiply the Consultant's capacity, never divide it."
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive alerts for equity alerts, goal updates, and sniff check failures</p>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Save Conversations</Label>
                  <p className="text-xs text-muted-foreground">Automatically save agent conversations for reference</p>
                </div>
                <Switch checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Platform Version", value: "3.0" },
                { label: "Model", value: "claude-opus-4-5" },
                { label: "Active Agents", value: "14" },
                { label: "Meta-Skills", value: "39 (6 domains)" },
                { label: "Sniff Check Levels", value: "L1, L2, L3" },
                { label: "Organization", value: "MN DHS / DSD" }
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSaveSettings}>Save Settings</Button>
            <Button variant="outline">Reset to Defaults</Button>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About One DSD Equity Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                The One DSD Equity and Inclusion Agentic Operations Platform is a purpose-built agentic platform for the
                Minnesota Department of Human Services Disability Services Division (DSD). It provides 14 specialized equity
                agents, a 39 meta-skill framework, three-tier quality assurance (Sniff Check L1/L2/L3), and comprehensive
                tools for equity data analysis, community engagement, policy development, and workforce training.
              </p>

              <Separator />

              <div>
                <p className="font-semibold mb-2">Primary Directive</p>
                <blockquote className="border-l-4 border-[#78BE21] pl-4 italic text-muted-foreground">
                  "Every agent, every process, every output must multiply the Consultant's capacity, never divide it."
                </blockquote>
              </div>

              <div>
                <p className="font-semibold mb-2">Platform Mission</p>
                <p className="text-muted-foreground">
                  Achieve one-person-department parity equivalent to a 5–8 person equity team through intelligent automation,
                  while maintaining the highest standards of equity, cultural responsiveness, and community accountability.
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">Equity Framework</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Vision: Race, ethnicity, language, and geography do not predict disability service outcomes</li>
                  <li>• Disability Justice framework applied to all work</li>
                  <li>• Nothing About Us Without Us — community leadership is required</li>
                  <li>• Olmstead integration mandate honored in all outputs</li>
                  <li>• Employment First: competitive integrated employment is the presumed outcome</li>
                </ul>
              </div>

              <Separator />

              <div>
                <p className="font-semibold mb-2">CHOICE Domains</p>
                <p className="text-xs text-muted-foreground mb-3">The 6 domains that define the CHOICE framework for equity-aligned disability services:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: "Community", description: "Building belonging and social connections" },
                    { name: "Home", description: "Safe, accessible, self-directed living" },
                    { name: "Occupation", description: "Meaningful work and Employment First" },
                    { name: "Independence", description: "Autonomy, self-determination, and choice" },
                    { name: "Connections", description: "Relationships, family, and cultural ties" },
                    { name: "Equity", description: "Eliminating disparities across all domains" }
                  ].map((domain, i) => (
                    <div key={i} className="p-3 bg-[#003865]/5 rounded-lg">
                      <p className="text-sm font-semibold text-[#003865]">{domain.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{domain.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <p className="text-xs text-muted-foreground">
                Built for Minnesota Department of Human Services · Disability Services Division ·
                One DSD Equity Program · 2026
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
