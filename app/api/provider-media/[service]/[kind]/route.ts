import { NextResponse } from "next/server";

const palette = {
  chef: { bg: "#2B1D15", mid: "#8E5A34", accent: "#E9B676", soft: "#F7E6D1", icon: "#FFE9BA" },
  maid: { bg: "#E7F4EA", mid: "#9CCAA4", accent: "#3B8F5A", soft: "#FDFEFE", icon: "#D8F4E0" },
  babysitter: { bg: "#F6E5DA", mid: "#EAB58F", accent: "#C86A57", soft: "#FFF8F3", icon: "#FFE7D7" },
  driver: { bg: "#DDEAF5", mid: "#6E9AC4", accent: "#233F67", soft: "#F9FCFF", icon: "#D8E8FF" },
  cleaner: { bg: "#DDF6EF", mid: "#57B99A", accent: "#0E7A60", soft: "#F6FFFC", icon: "#D6FFF2" },
  tutor: { bg: "#F4ECD8", mid: "#CDAF55", accent: "#6A4E19", soft: "#FFFDF6", icon: "#F7F1DA" },
  plumber: { bg: "#D8EEF1", mid: "#49A8B3", accent: "#145C74", soft: "#F7FEFF", icon: "#D6F8FD" },
  electrician: { bg: "#F6F1D8", mid: "#E2C14E", accent: "#735C07", soft: "#FFFDF5", icon: "#FFF2B8" },
} as const;

type PaletteKey = keyof typeof palette;

function isPaletteKey(value: string): value is PaletteKey {
  return value in palette;
}

function svgFor(service: string, kind: string) {
  const colors = palette[isPaletteKey(service) ? service : "chef"];

  if (kind === "portrait") {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="640" height="760" viewBox="0 0 640 760" fill="none">
        <rect width="640" height="760" rx="44" fill="${colors.bg}"/>
        <circle cx="520" cy="120" r="30" fill="#FFF4D6" opacity="0.9"/>
        <circle cx="132" cy="110" r="24" fill="#FFF4D6" opacity="0.72"/>
        <circle cx="410" cy="560" r="210" fill="${colors.mid}" opacity="0.18"/>
        <rect x="92" y="635" width="164" height="72" rx="36" fill="white" opacity="0.94"/>
        <circle cx="130" cy="671" r="12" fill="#16A34A"/>
        <text x="154" y="680" fill="#0F172A" font-family="Arial, sans-serif" font-size="28" font-weight="700">Online</text>
        <ellipse cx="320" cy="760" rx="190" ry="34" fill="#000" opacity="0.18"/>
        <circle cx="320" cy="234" r="78" fill="#F4D1B3"/>
        <path d="M226 230C226 171 267 124 320 124C373 124 414 171 414 230V272H226V230Z" fill="${colors.soft}"/>
        <path d="M210 204C222 136 266 96 320 96C374 96 418 136 430 204C394 170 354 154 320 154C286 154 246 170 210 204Z" fill="#111827"/>
        <rect x="214" y="302" width="212" height="248" rx="56" fill="#111827"/>
        <rect x="250" y="322" width="140" height="164" rx="24" fill="${colors.accent}" opacity="0.18"/>
        <path d="M260 364L218 550" stroke="#D9A441" stroke-width="24" stroke-linecap="round"/>
        <path d="M380 364L422 550" stroke="#D9A441" stroke-width="24" stroke-linecap="round"/>
        <path d="M214 322L134 464" stroke="#111827" stroke-width="24" stroke-linecap="round"/>
        <path d="M426 322L506 464" stroke="#111827" stroke-width="24" stroke-linecap="round"/>
        <path d="M225 308C243 282 274 270 320 270C366 270 397 282 415 308" stroke="#111827" stroke-width="28" stroke-linecap="round"/>
      </svg>
    `;
  }

  const captions: Record<string, string> = {
    "gallery-1": "Fresh",
    "gallery-2": "Signature",
    "gallery-3": "Premium",
  };

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 720 520" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${colors.bg}"/>
          <stop offset="0.55" stop-color="${colors.mid}"/>
          <stop offset="1" stop-color="${colors.accent}"/>
        </linearGradient>
      </defs>
      <rect width="720" height="520" rx="36" fill="url(#bg)"/>
      <circle cx="130" cy="116" r="72" fill="${colors.soft}" opacity="0.18"/>
      <circle cx="612" cy="114" r="84" fill="${colors.soft}" opacity="0.16"/>
      <ellipse cx="356" cy="420" rx="188" ry="48" fill="#0F172A" opacity="0.16"/>
      <rect x="140" y="196" width="438" height="168" rx="84" fill="${colors.soft}" opacity="0.92"/>
      <rect x="176" y="232" width="112" height="96" rx="30" fill="${colors.accent}" opacity="0.25"/>
      <rect x="310" y="226" width="236" height="110" rx="38" fill="${colors.bg}" opacity="0.24"/>
      <circle cx="206" cy="278" r="34" fill="${colors.icon}"/>
      <circle cx="404" cy="282" r="42" fill="${colors.icon}" opacity="0.92"/>
      <circle cx="470" cy="274" r="34" fill="${colors.icon}" opacity="0.82"/>
      <path d="M120 412C190 350 268 330 356 330C446 330 532 352 604 412" stroke="${colors.soft}" stroke-width="32" stroke-linecap="round" opacity="0.7"/>
      <text x="42" y="468" fill="white" font-family="Arial, sans-serif" font-size="52" font-weight="700">${captions[kind] ?? "Della"}</text>
    </svg>
  `;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ service: string; kind: string }> }
) {
  const { service, kind } = await context.params;
  const body = svgFor(service, kind);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
