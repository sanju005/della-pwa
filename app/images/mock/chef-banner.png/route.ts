import { NextResponse } from "next/server";

function bannerSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="260" viewBox="0 0 720 260" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#F5FFF8"/>
          <stop offset="1" stop-color="#E6FAEE"/>
        </linearGradient>
      </defs>
      <rect width="720" height="260" rx="34" fill="url(#bg)"/>
      <circle cx="116" cy="130" r="58" fill="#DFF6E7"/>
      <path d="M116 94 90 104v28c0 19 11 31 26 39 15-8 26-20 26-39v-28l-26-10Z" fill="#16A34A"/>
      <path d="m104 129 9 9 18-18" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="584" cy="104" r="88" fill="#16A34A" opacity="0.08"/>
      <circle cx="648" cy="150" r="54" fill="#16A34A" opacity="0.12"/>
      <path d="M556 72C574 54 600 44 630 44C662 44 688 54 706 72V234H556V72Z" fill="#16A34A"/>
      <circle cx="632" cy="84" r="28" fill="#F4D0B3"/>
      <path d="M596 92C602 64 614 52 632 52C650 52 662 64 668 92C654 82 642 78 632 78C622 78 610 82 596 92Z" fill="#0B0F19"/>
      <rect x="590" y="114" width="84" height="84" rx="20" fill="#0E6F35"/>
      <rect x="614" y="140" width="36" height="24" rx="5" fill="white" opacity="0.15"/>
      <text x="612" y="158" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="800">DELLA</text>
      <path d="M598 128L578 176" stroke="#F4D0B3" stroke-width="10" stroke-linecap="round"/>
      <path d="M666 128L688 170" stroke="#F4D0B3" stroke-width="10" stroke-linecap="round"/>
      <path d="M604 232c10-16 20-24 30-24s20 8 30 24" stroke="#0F7A38" stroke-width="16" stroke-linecap="round"/>
      <path d="M668 56 706 94v88l-38 38-38-38V94l38-38Z" fill="#1DA84D" opacity="0.9"/>
      <path d="m650 136 13 13 26-26" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="520" cy="110" r="5" fill="#39C96B"/>
      <circle cx="530" cy="98" r="3" fill="#39C96B"/>
      <circle cx="530" cy="122" r="3" fill="#39C96B"/>
    </svg>
  `;
}

export async function GET() {
  return new NextResponse(bannerSvg(), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
