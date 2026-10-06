/*
 * Печать «Кітап»: жёлтый круг с надписью по окружности и стрелкой в центре.
 * Надпись — текст сада на языке страницы, кольцо медленно вращается (CSS,
 * отключается при prefers-reduced-motion). Смысл печати дублирует sr-only
 * подпись у ссылки, поэтому сама картинка aria-hidden.
 */
export function Badge({ text }: { text: string }) {
  const label = `${text} • ${text} • `;
  return (
    <svg viewBox="0 0 200 200" className="kitap-seal-svg" aria-hidden>
      <circle cx="100" cy="100" r="97" fill="rgb(var(--kitap-yellow))" stroke="rgb(var(--kitap-ink))" strokeWidth="4" />
      <g className="kitap-seal-ring">
        <path id="kitap-seal-path" d="M100 100m-70 0a70 70 0 1 1 140 0a70 70 0 1 1-140 0" fill="none" />
        <text fill="rgb(var(--kitap-ink))" fontSize="21" fontWeight="800" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
          <textPath href="#kitap-seal-path" textLength="436" lengthAdjust="spacing">{label}</textPath>
        </text>
      </g>
      <path d="M78 122 122 78M90 78h32v32" fill="none" stroke="rgb(var(--kitap-ink))" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
