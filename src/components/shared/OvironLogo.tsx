import { cn } from "@/lib/utils";

interface OvironLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  /** Light text for dark surfaces (e.g. sidebar) */
  onDark?: boolean;
}

const sizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function OvironLogo({
  className,
  showTagline = false,
  size = "md",
  onDark = false,
}: OvironLogoProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          sizes[size],
          onDark ? "text-white" : ""
        )}
      >
        <span className={onDark ? "text-white" : "text-primary"}>OVIRON</span>
        <span className={onDark ? "text-rose-200" : "text-maroon"}>
          {" "}
          ONE
        </span>
      </span>
      {showTagline ? (
        <span
          className={cn(
            "text-xs",
            onDark ? "text-sidebar-muted" : "text-muted-foreground"
          )}
        >
          One platform. Every business.
        </span>
      ) : null}
    </div>
  );
}
