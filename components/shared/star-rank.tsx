interface StarRankProps {
  current: number;
  max: number;
  label?: string;
}

export function StarRank({ current, max, label }: StarRankProps) {
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="text-sm text-muted-foreground mr-1">{label}</span>
      )}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className="text-lg leading-none"
            style={{ color: i < current ? "rgb(234 179 8)" : "rgb(75 85 99)" }}
            aria-hidden="true"
          >
            {i < current ? "★" : "☆"}
          </span>
        ))}
      </div>
      <span className="sr-only">
        {current} sur {max} étoiles
      </span>
    </div>
  );
}
