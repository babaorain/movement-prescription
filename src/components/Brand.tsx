export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? 'brand--compact' : ''}`} href={window.location.pathname} aria-label="回到動作處方首頁">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M11 28c8-1 12-6 15-17 8 6 11 13 8 21-3 8-15 10-23 3 8 0 14-4 18-10-5 4-10 5-18 3Z" />
          <circle cx="35" cy="13" r="4" />
        </svg>
      </span>
      <span><b>動作處方</b>{!compact && <small>復健科醫師的居家運動建議</small>}</span>
    </a>
  )
}
