import { UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { toast } from "@/components/ui/use-toast";

export function EmployeesPage() {
  const { tenantId, branchId } = useShopScope();
  const employees = useDemoStore((s) => s.employees);
  const list = employees.filter(
    (e) => e.tenantId === tenantId && (!branchId || e.branchId === branchId)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Staff roster with roles per branch."
        actions={
          <Button
            className="gap-2"
            onClick={() => toast({ title: "Invite sent (demo)", description: "SMS onboarding stub." })}
          >
            <UserCheck className="h-4 w-4" />
            Invite staff
          </Button>
        }
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell>{e.role}</TableCell>
                <TableCell>{e.phone}</TableCell>
                <TableCell>
                  <Badge variant={e.isActive ? "default" : "secondary"}>
                    {e.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
