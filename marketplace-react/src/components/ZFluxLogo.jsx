export default function ZFluxLogo() {
  return (
    <span className="flex items-center gap-[9px]">
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:scale-[1.07] group-hover:rotate-[-2deg]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="zfBg" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#232323" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
          <linearGradient id="zfStroke" x1="7" y1="9" x2="31" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d4a84b" />
            <stop offset="100%" stopColor="#8b6f47" />
          </linearGradient>
          <filter id="zfGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="38" height="38" rx="10" fill="url(#zfBg)" />
        <rect x="1" y="1" width="36" height="36" rx="9.5" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
        <path
          d="M9 10.5 L29 10.5 L9 27.5 L29 27.5"
          stroke="url(#zfStroke)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#zfGlow)"
        />
        <circle cx="19" cy="19" r="2.2" fill="#d4a84b" opacity="0.85" />
      </svg>
      <span className="text-xl font-extrabold tracking-[-0.5px] text-primary not-italic">
        Z<em className="text-secondary not-italic">Flux</em>
      </span>
    </span>
  );
}
