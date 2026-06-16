type ZigzagProps = { className: string };

// The blue zigzag traced inside each problem card. pathLength=100 normalises the
// draw across the differently-sized cards; the path is identical in all three.
export function Zigzag({ className }: ZigzagProps) {
  return (
    <svg
      viewBox="0 0 373.321 394.919"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={className}
        d="M359.566 26.0968L31.1744 199.187C28.3031 200.701 29.5459 205.062 32.7836 204.834L312.456 185.178C315.545 184.961 316.898 188.997 314.302 190.685L54.123 359.866C51.4433 361.608 52.9837 365.774 56.1524 365.355L359.566 325.158"
        stroke="#5A90F4"
        strokeWidth="59"
        pathLength="100"
      />
    </svg>
  );
}
