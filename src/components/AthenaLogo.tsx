export function AthenaLogo({ className = "h-10 w-auto", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={`${className} flex items-center justify-center flex-shrink-0`}>
      <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gold / Amber upper swoosh */}
        <path d="M20 38 C 60 12, 140 12, 180 38" stroke="#C89328" strokeWidth="8" strokeLinecap="round" />
        {/* Blue lower swoosh */}
        <path d="M40 54 C 75 34, 125 34, 160 54" stroke="#1D3B6F" strokeWidth="7" strokeLinecap="round" />
        {/* ATHENA text */}
        <text 
          x="100" 
          y="84" 
          textAnchor="middle" 
          fill={dark ? "#FFFFFF" : "#111827"} 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="26" 
          fontWeight="900" 
          letterSpacing="3"
        >
          ATHENA
        </text>
        {/* CENTRE text with side rules */}
        <line x1="30" y1="100" x2="72" y2="100" stroke="#C89328" strokeWidth="2" />
        <text 
          x="100" 
          y="103" 
          textAnchor="middle" 
          fill={dark ? "#93C5FD" : "#4B5563"} 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="10" 
          fontWeight="700" 
          letterSpacing="3"
        >
          CENTRE
        </text>
        <line x1="128" y1="100" x2="170" y2="100" stroke="#C89328" strokeWidth="2" />
      </svg>
    </div>
  );
}
