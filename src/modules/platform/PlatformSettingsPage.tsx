import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

export function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Platform settings" description="Branding, billing provider, and feature flags." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="max-w-md space-y-3">
          <div>
            <Label>Support email</Label>
            <Input className="mt-1" defaultValue="support@oviron.one" />
          </div>
          <Button onClick={() => toast({ title: "Settings saved (demo)" })}>Save</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between max-w-md">
          <span className="text-sm">AI Assistant (beta)</span>
          <Switch defaultChecked />
        </CardContent>
      </Card>
    </div>
  );
}
