/* Рисунки «Кемпірқосақ»: радуга (она же логотип). Украшение — aria-hidden. */

const ARCS = ['#FF8FA3', '#FFB86B', '#FFE07A', '#8FE0B0', '#8EC9FF', '#B9A3FF'];

export function Rainbow({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 200 110" fill="none" aria-hidden>
      {ARCS.map((color, index) => (
        <path key={color} d={`M${10 + index * 9} 105a${90 - index * 9} ${90 - index * 9} 0 0 1 ${180 - index * 18} 0`} stroke={color} strokeWidth="8" strokeLinecap="round" />
      ))}
    </svg>
  );
}
