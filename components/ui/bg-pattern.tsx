import * as React from "react";

type BGPatternProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "dots";
  mask?: "fade-center" | "fade-edges" | "none";
  size?: number;
  fill?: string;
};

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export function BGPattern({
  className,
  variant = "dots",
  mask = "fade-center",
  size = 24,
  fill = "rgba(255,255,255,0.06)",
  style,
  ...props
}: BGPatternProps) {
  const maskImage = {
    "fade-center": "radial-gradient(circle at center, black 0%, black 34%, transparent 78%)",
    "fade-edges": "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
    none: undefined,
  }[mask];

  const patternStyle: React.CSSProperties = variant === "dots"
    ? {
        backgroundImage: `radial-gradient(circle, ${fill} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }
    : {};

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        ...patternStyle,
        WebkitMaskImage: maskImage,
        maskImage,
        ...style,
      }}
      {...props}
    />
  );
}
