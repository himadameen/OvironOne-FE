import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";

export function ProjectsPage() {
  const navigate = useNavigate();
  const { tenantId, branchId } = useShopScope();
  const projects = useDemoStore((s) => s.projects);
  const list = projects.filter(
    (p) => p.tenantId === tenantId && (!branchId || p.branchId === branchId)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Paint and fit-out jobs linked to materials."
        actions={
          <Button onClick={() => toast({ title: "Quote created (demo)" })}>New quote</Button>
        }
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Est. value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length ? (
              list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatINR(p.estimatedAmount)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No projects for this tenant — try Ambur Paint House.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button variant="link" className="px-0" onClick={() => navigate("/app/painters")}>
        Manage painters
      </Button>
    </div>
  );
}
