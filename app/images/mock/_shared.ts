export function portraitSvg(slug: string) {
  const people = {
    "chef-amina": {
      bg: ["#2D1D14", "#8B5C33", "#E3B26D"],
      outfit: "#111827",
      accent: "#D9A441",
      skin: "#F3CDB0",
      label: "Chef Amina",
    },
    "chef-daniel": {
      bg: ["#2A2418", "#7A5A34", "#D8B187"],
      outfit: "#1F2937",
      accent: "#E4B74A",
      skin: "#EFC9A6",
      label: "Chef Daniel",
    },
    "chef-mei-ling": {
      bg: ["#3A251A", "#9A6139", "#E1BA8C"],
      outfit: "#15212E",
      accent: "#E8B84B",
      skin: "#F3D7BE",
      label: "Chef Mei Ling",
    },
    "chef-hikaru": {
      bg: ["#231C16", "#7D5632", "#D4AB79"],
      outfit: "#18212B",
      accent: "#D9A441",
      skin: "#F1D1B8",
      label: "Chef Hikaru",
    },
    "chef-sofia": {
      bg: ["#342117", "#885632", "#E1AF7A"],
      outfit: "#1A2430",
      accent: "#E0AE45",
      skin: "#F2CBB0",
      label: "Chef Sofia",
    },
  } as const;

  const person = people[slug as keyof typeof people] ?? people["chef-amina"];
  const [dark, mid, light] = person.bg;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="760" viewBox="0 0 640 760" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${dark}"/>
          <stop offset="0.55" stop-color="${mid}"/>
          <stop offset="1" stop-color="${light}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="760" rx="42" fill="url(#bg)"/>
      <circle cx="126" cy="116" r="34" fill="#FFF1C6" opacity="0.9"/>
      <circle cx="514" cy="108" r="28" fill="#FFF1C6" opacity="0.82"/>
      <circle cx="320" cy="388" r="248" fill="#FFF" opacity="0.08"/>
      <ellipse cx="320" cy="714" rx="202" ry="34" fill="#000" opacity="0.18"/>
      <circle cx="320" cy="228" r="82" fill="${person.skin}"/>
      <path d="M214 236C214 158 260 114 320 114C380 114 426 158 426 236V278H214V236Z" fill="#111827"/>
      <path d="M196 210C208 138 258 96 320 96C382 96 432 138 444 210C402 168 360 150 320 150C280 150 238 168 196 210Z" fill="#0B0F19"/>
      <path d="M236 300C256 282 284 272 320 272C356 272 384 282 404 300V566H236V300Z" fill="${person.outfit}"/>
      <rect x="258" y="334" width="124" height="146" rx="22" fill="${person.accent}" opacity="0.18"/>
      <path d="M258 378L218 564" stroke="${person.accent}" stroke-width="22" stroke-linecap="round"/>
      <path d="M382 378L422 564" stroke="${person.accent}" stroke-width="22" stroke-linecap="round"/>
      <path d="M236 330L154 474" stroke="${person.outfit}" stroke-width="22" stroke-linecap="round"/>
      <path d="M404 330L486 474" stroke="${person.outfit}" stroke-width="22" stroke-linecap="round"/>
      <path d="M228 314C246 286 278 274 320 274C362 274 394 286 412 314" stroke="${person.outfit}" stroke-width="26" stroke-linecap="round"/>
      <rect x="72" y="632" width="196" height="66" rx="33" fill="white" opacity="0.96"/>
      <circle cx="112" cy="665" r="10" fill="#16A34A"/>
      <text x="136" y="674" fill="#0F172A" font-family="Arial, sans-serif" font-size="28" font-weight="700">Available Today</text>
      <text x="40" y="60" fill="white" font-family="Arial, sans-serif" font-size="26" font-weight="700" opacity="0.0">${person.label}</text>
    </svg>
  `;
}
