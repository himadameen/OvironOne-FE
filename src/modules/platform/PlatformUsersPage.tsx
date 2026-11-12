import { Shield } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

const USERS = [
  { name: "OVIRON Admin", email: "admin@oviron.one", role: "Super admin" },
  { name: "Support Lead", email: "support@oviron.one", role: "Support" },
  { name: "Billing Ops", email: "billing@oviron.one", role: "Finance" },
];

export function PlatformUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform users"
        description="Internal team with access to master console."
        actions={
          <Button
            className="gap-2"
            onClick={() => toast({ title: "Invite sent (demo)" })}
          >
            <Shield className="h-4 w-4" />
            Invite user
          </Button>
        }
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {USERS.map((u) => (
              <TableRow key={u.email}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
