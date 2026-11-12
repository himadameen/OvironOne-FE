import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { toast } from "@/components/ui/use-toast";

export function SettingsPage() {
  const { tenant, branch } = useShopScope();
  const resetDemo = useDemoStore((s) => s.resetDemo);

  return (
    <div className="space-y-6">
      <PageHeader title="Shop settings" description="Profile, tax, and demo controls." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business profile</CardTitle>
          <CardDescription>GST and contact shown on invoices.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 max-w-md">
          <div>
            <Label>Shop name</Label>
            <Input className="mt-1" defaultValue={tenant?.name} readOnly />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input className="mt-1" defaultValue={tenant?.gstin} readOnly />
          </div>
          <div>
            <Label>Branch</Label>
            <Input className="mt-1" defaultValue={branch?.name} readOnly />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">POS options</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between max-w-md">
          <span className="text-sm">Show MRP on receipt</span>
          <Switch defaultChecked />
        </CardContent>
      </Card>
      <Button
        variant="destructive"
        onClick={() => {
          resetDemo();
          toast({ title: "Demo data reset" });
        }}
      >
        Reset demo database
      </Button>
    </div>
  );
}
