export function Gauge({ diffAbsolute, diffPercent }: { diffAbsolute: number, diffPercent: number }) {
  const clamped = Math.max(-50, Math.min(50, diffPercent));
  const travel = (clamped / 50) * 50;
  const isPos = diffAbsolute > 0;
  const isNeg = diffAbsolute < 0;

  const trackColor = isPos
    ? 'rgba(47,209,128,0.12)'
    : isNeg
    ? 'rgba(255,92,92,0.12)'
    : 'rgba(86,93,112,0.15)';

  const fillGradient = isPos
    ? 'linear-gradient(90deg, rgba(47,209,128,0.15), #2FD180)'
    : 'linear-gradient(270deg, rgba(255,92,92,0.15), #FF5C5C)';

  const dotColor = isPos ? '#2FD180' : isNeg ? '#FF5C5C' : '#565D70';
  const dotGlow = isPos
    ? '0 0 8px 2px rgba(47,209,128,0.55)'
    : isNeg
    ? '0 0 8px 2px rgba(255,92,92,0.55)'
    : 'none';

  return (
    <div
      className="relative h-[6px] rounded-full mx-1 mt-2 mb-2.5 border border-border"
      style={{ background: trackColor }}
    >
      {/* centre line */}
      <div className="absolute top-[-3px] bottom-[-3px] left-1/2 w-px bg-border opacity-70" />

      {/* fill bar */}
      <div
        className="absolute top-0 bottom-0 rounded-full transition-all duration-150"
        style={{
          left: isPos ? '50%' : `${50 - Math.abs(travel)}%`,
          width: `${Math.abs(travel)}%`,
          background: fillGradient,
        }}
      />

      {/* thumb */}
      <div
        className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-calc-surface border-[2.5px] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
        style={{
          left: `${50 + travel}%`,
          borderColor: dotColor,
          boxShadow: dotGlow,
        }}
      />
    </div>
  );
}
