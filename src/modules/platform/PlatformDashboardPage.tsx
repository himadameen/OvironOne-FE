import { Building2, IndianRupee, UserPlus, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDemoStore } from "@/stores/demo-store";
import { formatINR } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PlatformDashboardPage() {
  const navigate = useNavigate();
  const shops = useDemoStore((s) => s.platformShops);
  const mrr = shops.reduce((sum, s) => sum + s.mrr, 0);
  const active = shops.filter((s) => s.status === "active").length;
  const trial = shops.filter((s) => s.status === "trial").length;

  const chartData = shops.map((s) => ({
    name: s.shopName.split(" ")[0],
    mrr: s.mrr,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform dashboard"
        description="OVIRON ONE network — shops, revenue, and onboarding pipeline."
        actions={
          <Button onClick={() => navigate("/platform/shops/create")}>Create shop</Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Live shops" value={String(active)} icon={Building2} subtitle={`${trial} on trial`} />
        <KpiCard title="Platform MRR" value={formatINR(mrr, true)} icon={IndianRupee} trend={{ value: "+8% MoM (demo)", positive: true }} />
        <KpiCard title="New this month" value="2" icon={UserPlus} />
        <KpiCard title="API uptime" value="99.97%" icon={Zap} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">MRR by shop</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="mrr" fill="hsl(175 84% 26%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Recent shops</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.slice(0, 5).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.shopName}</p>
                      <p className="text-xs text-muted-foreground">{s.city}</p>
                    </TableCell>
                    <TableCell className="capitalize">{s.plan}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatINR(s.mrr)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
