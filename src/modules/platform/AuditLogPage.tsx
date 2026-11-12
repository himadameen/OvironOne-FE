import { PageHeader } from "@/components/shared/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EVENTS = [
  { at: "2025-11-12 14:02", actor: "admin@oviron.one", action: "shop.trial_extended", target: "Oviron Leather Store" },
  { at: "2025-11-11 09:18", actor: "support@oviron.one", action: "shop.impersonate", target: "Toy House" },
  { at: "2025-11-10 16:44", actor: "billing@oviron.one", action: "subscription.upgraded", target: "Ambur Paint House" },
];

export function AuditLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Immutable platform activity trail (demo)." />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EVENTS.map((e) => (
              <TableRow key={e.at + e.action}>
                <TableCell className="font-mono text-xs">{e.at}</TableCell>
                <TableCell>{e.actor}</TableCell>
                <TableCell>{e.action}</TableCell>
                <TableCell>{e.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
