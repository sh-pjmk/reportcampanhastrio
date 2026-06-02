export function TrioLogo({ width = 80 }: { width?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={width}
      height={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" fill="#6B0F1A" />
      <text
        x="50"
        y="63"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="34"
        fontWeight="300"
        letterSpacing="3"
        fill="#C9A84C"
        textAnchor="middle"
        dominantBaseline="auto"
      >
        TRIO
      </text>
    </svg>
  );
}
