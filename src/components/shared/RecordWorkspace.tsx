import { type ReactNode, useMemo, useState } from "react";
import { Inbox, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/shared/KpiCard";

export interface RecordColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface RecordWorkspaceProps<T> {
  title: string;
  description?: string;
  demoNote?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  kpis?: { label: string; value: string; subtitle?: string }[];
  searchPlaceholder?: string;
  rows: T[];
  columns: RecordColumn<T>[];
  filterRow?: (row: T, query: string) => boolean;
  emptyTitle?: string;
  children?: ReactNode;
}

export function RecordWorkspace<T>({
  title,
  description,
  demoNote,
  primaryAction,
  secondaryAction,
  kpis,
  searchPlaceholder = "Search…",
  rows,
  columns,
  filterRow,
  emptyTitle = "No records found",
  children,
}: RecordWorkspaceProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim() || !filterRow) return rows;
    return rows.filter((r) => filterRow(r, query.trim().toLowerCase()));
  }, [rows, query, filterRow]);

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title={title}
        description={description}
        demoNote={demoNote}
        actions={
          <div className="flex flex-wrap gap-2">
            {secondaryAction ? (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null}
            {primaryAction ? (
              <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            ) : null}
          </div>
        }
      />

      {children}

      {kpis?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} title={k.label} value={k.value} subtitle={k.subtitle} />
          ))}
        </div>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} record{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={emptyTitle}
              description="Try adjusting your search or add new records using the action above."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c.key} className={c.className}>
                        {c.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map((c) => (
                        <TableCell key={c.key} className={c.className}>
                          {c.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
