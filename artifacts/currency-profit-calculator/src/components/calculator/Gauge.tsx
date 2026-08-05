export function Gauge({ diffAbsolute, diffPercent }: { diffAbsolute: number, diffPercent: number }) {
  const clamped = Math.max(-50, Math.min(50, diffPercent));
  const travel = (clamped / 50) * 50;
  
  const isPos = diffAbsolute >= 0;
  
  return (
    <div className="relative h-2 rounded-full bg-calc-surface2 border border-border mx-1 mt-1.5 mb-2">
      <div className="absolute top-[-2px] bottom-[-2px] left-1/2 w-px bg-muted-foreground opacity-60" />
      
      <div 
        className="absolute top-0 bottom-0 rounded-full"
        style={{
          left: isPos ? '50%' : `${50 - Math.abs(travel)}%`,
          width: `${Math.abs(travel)}%`,
          background: isPos 
            ? 'linear-gradient(90deg, rgba(47,209,128,0.15), #2FD180)' 
            : 'linear-gradient(90deg, #FF5C5C, rgba(255,92,92,0.15))'
        }}
      />
      
      <div 
        className="absolute top-1/2 w-3 h-3 rounded-full bg-calc-surface border-[2.5px] shadow-sm transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${50 + travel}%`,
          borderColor: diffAbsolute > 0 ? '#2FD180' : diffAbsolute < 0 ? '#FF5C5C' : '#565D70'
        }}
      />
    </div>
  );
}
