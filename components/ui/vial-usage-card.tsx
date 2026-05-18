import * as React from "react";

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

type VialIllustrationProps = React.SVGAttributes<SVGSVGElement> & {
  doses: number;
  leftoverMl: number;
  liquidLabel?: string;
};

export function VialIllustration({
  doses,
  leftoverMl,
  liquidLabel,
  className,
  ...props
}: VialIllustrationProps) {
  const reactId = React.useId();
  const id = reactId.replace(/:/g, "");
  const clipId = `vial-liquid-clip-${id}`;
  const leftHighlightId = `vial-left-highlight-${id}`;
  const rightHighlightId = `vial-right-highlight-${id}`;
  const liquidGradientId = `vial-liquid-gradient-${id}`;
  const ariaLabel = liquidLabel ?? `Vial: ${doses} doses, ${leftoverMl.toFixed(2)} mL leftover.`;

  return (
    <svg
      role="img"
      viewBox="0 0 80 122"
      className={cn("block h-40 w-auto", className)}
      aria-label={ariaLabel}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M 19.5 38.5 L 19.5 111.5 Q 19.5 116.5 24 116.5 L 56 116.5 Q 60.5 116.5 60.5 111.5 L 60.5 38.5 Z" />
        </clipPath>
        <linearGradient id={leftHighlightId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.22" />
          <stop offset="0.55" stopColor="white" stopOpacity="0.04" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={rightHighlightId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.55" stopColor="white" stopOpacity="0.04" />
          <stop offset="1" stopColor="white" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={liquidGradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.58" />
        </linearGradient>
      </defs>
      <rect x="23" y="2" width="34" height="10" rx="2.5" fill="currentColor" opacity="0.38" />
      <rect x="24.5" y="2.8" width="31" height="1" rx="0.5" fill="white" opacity="0.16" />
      <line x1="23.5" y1="11.4" x2="56.5" y2="11.4" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6" />
      <rect x="25" y="12" width="30" height="8" rx="0.5" fill="currentColor" opacity="0.2" />
      <line x1="25.5" y1="19.7" x2="54.5" y2="19.7" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.6" />
      <path
        d="M 29 20 L 29 26 C 29 29 18 35 18 38 L 18 112 Q 18 118 24 118 L 56 118 Q 62 118 62 112 L 62 38 C 62 35 51 29 51 26 L 51 20 Z"
        fill="rgba(9,9,9,0.88)"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <line x1="29" y1="20" x2="29" y2="26" stroke="currentColor" strokeOpacity="0.24" strokeWidth="0.6" />
      <line x1="51" y1="20" x2="51" y2="26" stroke="currentColor" strokeOpacity="0.24" strokeWidth="0.6" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="18" y="38" width="44" height="80" fill={`url(#${liquidGradientId})`} className="transition-all duration-700 ease-out" />
        <rect x="18" y="38" width="19.8" height="80" fill={`url(#${leftHighlightId})`} pointerEvents="none" />
        <rect x="55.4" y="38" width="6.6" height="80" fill={`url(#${rightHighlightId})`} pointerEvents="none" />
        <path
          d="M 19.5 38.5 L 19.5 111.5 Q 19.5 116.5 24 116.5 L 56 116.5 Q 60.5 116.5 60.5 111.5 L 60.5 38.5 Z"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="0.75"
          pointerEvents="none"
        />
      </g>
    </svg>
  );
}

type VialUsageCardProps = {
  daysOfSupply: number;
  dosesPerVial: number;
  vialVolumeMl: number;
  concentrationMgPerMl: number;
  leftoverMl: number;
  className?: string;
};

export function VialUsageCard({
  daysOfSupply,
  dosesPerVial,
  vialVolumeMl,
  concentrationMgPerMl,
  leftoverMl,
  className,
}: VialUsageCardProps) {
  return (
    <section className={cn("vial-usage-card", className)}>
      <div className="vial-usage-content">
        <p className="vial-usage-kicker">Vial usage</p>
        <strong>~{Math.round(daysOfSupply)} days of supply</strong>
        <span>{dosesPerVial} full doses from a {vialVolumeMl} mL vial</span>
        <span>{concentrationMgPerMl} mg/mL · {leftoverMl > 0.01 ? `${leftoverMl.toFixed(2)} mL leftover` : "0 mL leftover"}</span>
      </div>
      <VialIllustration doses={dosesPerVial} leftoverMl={leftoverMl} />
    </section>
  );
}
