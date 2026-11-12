import { Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";

export function PaintersPage() {
  const navigate = useNavigate();
  const { tenantId } = useShopScope();
  const painters = useDemoStore((s) => s.painters);
  const list = painters.filter((p) => p.tenantId === tenantId);

  if (tenantId !== "tenant-ambur") {
    return (
      <div className="space-y-6">
        <PageHeader title="Painters" description="Painter network is enabled for paint shops." />
        <p className="text-sm text-muted-foreground">
          Switch to Ambur Paint House demo to see painter data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painters"
        description="Contractor partners for project billing."
        actions={<Button onClick={() => navigate("/app/projects")}>View projects</Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between">
                {p.name}
                <span className="flex items-center text-sm text-amber-600 gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {p.rating}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p>{p.specialty}</p>
              <p>{p.jobsCompleted} jobs completed</p>
              <p>{p.phone}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
