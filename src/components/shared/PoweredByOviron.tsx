import { cn } from "@/lib/utils";

interface PoweredByOvironProps {
  className?: string;
  onDark?: boolean;
}

export function PoweredByOviron({ className, onDark }: PoweredByOvironProps) {
  return (
    <p
      className={cn(
        "text-xs",
        onDark ? "text-sidebar-muted" : "text-muted-foreground",
        className
      )}
    >
      Powered by{" "}
      <span
        className={cn(
          "font-display font-semibold",
          onDark ? "text-white" : "text-primary"
        )}
      >
        OVIRON
      </span>
    </p>
  );
}
